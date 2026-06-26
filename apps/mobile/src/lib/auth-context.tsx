import type { UserRole } from "@hoomies/shared/types/database.types";
import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";

type MiniProfile = {
  id: string;
  full_name: string | null;
  role: UserRole | null;
  onboarding_completed: boolean;
} | null;

type SessionContextValue = {
  session: Session | null;
  profile: MiniProfile;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  profile: null,
  isLoading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MiniProfile>(null);
  const [isLoading, setIsLoading] = useState(true);
  const loadToken = useRef(0);

  async function loadProfile(userId: string) {
    const token = ++loadToken.current;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, onboarding_completed")
      .eq("id", userId)
      .maybeSingle();
    // Yalnızca en son istek uygulanır (demo reset yarışını önler).
    if (token === loadToken.current) setProfile(data);
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session) await loadProfile(data.session.user.id);
      setIsLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next) loadProfile(next.user.id);
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function refreshProfile() {
    // Güncel oturumu oku (stale closure'a düşme).
    const { data } = await supabase.auth.getSession();
    if (data.session) await loadProfile(data.session.user.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <SessionContext.Provider
      value={{ session, profile, isLoading, refreshProfile, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import type { ReferralCode } from "@/lib/types/database.types";
import { cn } from "@/lib/utils";

export function ReferralCodes({ codes }: { codes: ReferralCode[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  const usedCount = codes.filter((c) => c.used_by).length;

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success("Kod kopyalandı");
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch {
      toast.error("Kopyalanamadı");
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Arkadaşların bu kodlarla kayıt olursa her biri için <strong>+1 puan</strong>{" "}
        kazanırsın. ({usedCount}/{codes.length} kullanıldı)
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {codes.map((c) => {
          const used = !!c.used_by;
          return (
            <button
              key={c.code}
              type="button"
              disabled={used}
              onClick={() => copy(c.code)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 font-mono text-sm transition-colors",
                used
                  ? "border-border bg-muted text-muted-foreground line-through"
                  : "border-border hover:border-primary/50 hover:bg-primary/5",
              )}
            >
              {c.code}
              {!used &&
                (copied === c.code ? (
                  <Check className="size-4 text-primary" />
                ) : (
                  <Copy className="size-4 text-muted-foreground" />
                ))}
            </button>
          );
        })}
      </div>
    </div>
  );
}

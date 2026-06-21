import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Chat } from "@/features/messages/chat";
import { CompatibilityBadge } from "@/features/listings/compatibility-badge";
import { getConversation } from "@/features/messages/queries";
import { requireOnboardedProfile } from "@/lib/auth";

export const metadata = { title: "Sohbet" };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const { id } = await params;
  const data = await getConversation(id, profile.id);
  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/messages"
            className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Mesajlar
          </Link>
          <h1 className="truncate text-xl font-bold tracking-tight">
            {data.other?.full_name ?? "Kullanıcı"}
          </h1>
        </div>
        {data.listing && (
          <Link
            href={`/listings/${data.listing.id}`}
            className="shrink-0 text-sm font-medium text-primary hover:underline"
          >
            İlanı gör
          </Link>
        )}
      </div>

      {data.otherAnswers.length > 0 && (
        <details
          className="group mb-4 rounded-2xl border border-border bg-card p-4"
          open
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium">
            <span>
              {data.isHost ? "İsteyen kişinin" : "Karşı tarafın"} uyum profili
            </span>
            {data.otherScore != null && <CompatibilityBadge score={data.otherScore} />}
          </summary>
          <ul className="mt-3 space-y-2 border-t border-border pt-3">
            {data.otherAnswers.map((a, i) => (
              <li key={i} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{a.question}</span>
                <span className="shrink-0 font-medium">{a.answer}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <Chat
        conversationId={id}
        meId={profile.id}
        isHost={data.isHost}
        status={data.conversation.status}
        otherName={data.other?.full_name ?? "Kullanıcı"}
        district={data.listing?.district ?? null}
        listingId={data.listing?.id ?? null}
        listingStatus={data.listing?.status ?? null}
        initialMessages={data.messages}
      />
    </div>
  );
}

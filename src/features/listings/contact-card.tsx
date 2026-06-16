"use client";

import { Coffee, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ContactCard({
  ownerName,
  ownerAvatar,
  university,
  department,
  isOwner,
}: {
  ownerName: string;
  ownerAvatar: string | null;
  university: string | null;
  department: string | null;
  isOwner: boolean;
}) {
  const initials = ownerName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {ownerAvatar ? <AvatarImage src={ownerAvatar} alt={ownerName} /> : null}
          <AvatarFallback>{initials || "?"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold">{ownerName}</p>
          <p className="truncate text-sm text-muted-foreground">
            {[department, university].filter(Boolean).join(" · ") || "Doğrulanmış öğrenci"}
          </p>
        </div>
      </div>

      <Button
        className="mt-4 w-full"
        disabled={isOwner}
        onClick={() =>
          toast.info("Mesajlaşma çok yakında — eşleşme sonrası platform içinde açılacak.")
        }
      >
        <MessageCircle /> {isOwner ? "Bu senin ilanın" : "İletişime geç"}
      </Button>

      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" /> Edu mail ile doğrulanmış üye
        </p>
        <p className="flex items-center gap-1.5">
          <Coffee className="size-3.5 text-primary" /> İlk buluşmayı yakın bir kafede yapman önerilir
        </p>
      </div>
    </div>
  );
}

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

// Uyum yüzdesine göre renk tonlu rozet. Görüntüleyen ile ilan sahibi arasındaki skor.
export function CompatibilityBadge({
  score,
  className,
}: {
  score: number;
  className?: string;
}) {
  const tier =
    score >= 75
      ? "bg-emerald-500/12 text-emerald-700 border-emerald-500/25"
      : score >= 50
        ? "bg-primary/12 text-primary border-primary/25"
        : "bg-amber-500/12 text-amber-700 border-amber-500/25";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        tier,
        className,
      )}
    >
      <Heart className="size-3.5" />%{score} uyum
    </span>
  );
}

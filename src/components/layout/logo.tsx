import Link from "next/link";
import { HousePlus } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2", className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <HousePlus className="size-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        hoomies
      </span>
    </Link>
  );
}

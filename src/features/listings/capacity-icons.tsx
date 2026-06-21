import { User } from "lucide-react";

import { cn } from "@/lib/utils";

// Kişi kapasitesi: dolu olanlar soluk + çizik, müsait olanlar turuncu.
export function CapacityIcons({
  capacity,
  occupied,
  className,
}: {
  capacity: number;
  occupied: number;
  className?: string;
}) {
  const total = Math.max(capacity, occupied, 1);
  const available = Math.max(capacity - occupied, 0);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      title={`${available} müsait / ${capacity} kişilik`}
      aria-label={`${available} müsait, ${capacity} kişilik`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isOccupied = i < occupied;
        return (
          <span key={i} className="relative inline-flex">
            <User
              className={cn(
                "size-4",
                isOccupied ? "text-muted-foreground/40" : "text-primary",
              )}
            />
            {isOccupied && (
              <span className="absolute top-1/2 left-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted-foreground/60" />
            )}
          </span>
        );
      })}
    </span>
  );
}

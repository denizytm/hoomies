import { Logo } from "@/components/layout/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="max-w-sm">
            Üniversite öğrencileri için güvenli ev arkadaşı eşleşmesi. Edu mail ile
            doğrulanmış topluluk.
          </p>
        </div>
        <p className="text-xs">
          © {new Date().getFullYear()} hoomies · Kapalı beta · ODTÜ, Ankara
        </p>
      </div>
    </footer>
  );
}

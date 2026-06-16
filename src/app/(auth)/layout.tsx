export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_40%_at_50%_0%,var(--color-accent),transparent)]"
      />
      <div className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-12 sm:py-16">
        {children}
      </div>
    </div>
  );
}

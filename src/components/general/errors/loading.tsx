export const Loading = () => {
  return (
    <div
      className="relative flex min-h-svh flex-col overflow-hidden bg-background"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.06_145_/0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.32_0.05_260_/0.35),transparent_50%)]"
      />

      <header className="relative z-10 px-6 py-5 md:px-10">
        <img
          src="/tisini.png"
          alt="Tisini"
          className="h-9 w-auto object-contain dark:invert"
        />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 items-end gap-1.5" aria-hidden>
            {[35, 65, 45, 85, 55].map((height, index) => (
              <span
                key={height}
                className="w-2 animate-pulse rounded-full bg-accent-foreground/80 motion-reduce:animate-none"
                style={{
                  height: `${height}%`,
                  animationDelay: `${index * 120}ms`,
                }}
              />
            ))}
          </div>

          <p className="mt-7 font-heading text-sm font-semibold tracking-[0.18em] text-foreground uppercase">
            Reading the numbers
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Preparing your Tisini experience…
          </p>
        </div>
      </main>
    </div>
  )
}

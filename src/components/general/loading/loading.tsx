const BALLS = [
  'oklch(0.62 0.16 255)',
  'oklch(0.72 0.16 145)',
  'oklch(0.78 0.15 85)',
  'oklch(0.65 0.2 25)',
  'oklch(0.7 0.14 310)',
]

export default function LoadingComponent() {
  return (
    <div
      className="relative flex min-h-svh flex-col overflow-hidden bg-background"
      role="status"
      aria-live="polite"
      aria-label="We are gathering the numbers for you"
    >
      <style>{`
        @keyframes gather-bounce {
          0%, 100% { transform: translateY(0) scale(1, 1); }
          45% { transform: translateY(-1.65rem) scale(0.92, 1.08); }
          70% { transform: translateY(0) scale(1.12, 0.88); }
        }
        @keyframes gather-shadow {
          0%, 100% { transform: scaleX(1); opacity: 0.35; }
          45% { transform: scaleX(0.55); opacity: 0.12; }
          70% { transform: scaleX(1.15); opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gather-ball, .gather-shadow { animation: none !important; }
        }
      `}</style>

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
          <div className="flex items-end gap-3" aria-hidden>
            {BALLS.map((color, index) => (
              <span key={color} className="flex w-4 flex-col items-center">
                <span
                  className="gather-ball size-4 rounded-full"
                  style={{
                    backgroundColor: color,
                    boxShadow: `0 8px 16px color-mix(in oklch, ${color} 45%, transparent)`,
                    animation: 'gather-bounce 0.7s ease-in-out infinite',
                    animationDelay: `${index * 110}ms`,
                  }}
                />
                <span
                  className="gather-shadow mt-2 h-1.5 w-4 rounded-full bg-foreground/50 blur-[1px]"
                  style={{
                    animation: 'gather-shadow 0.7s ease-in-out infinite',
                    animationDelay: `${index * 110}ms`,
                  }}
                />
              </span>
            ))}
          </div>

          <p className="mt-8 font-heading text-lg font-semibold tracking-tight text-heading text-balance sm:text-xl">
            We are gathering the numbers for you
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This usually takes a moment.
          </p>
        </div>
      </main>
    </div>
  )
}

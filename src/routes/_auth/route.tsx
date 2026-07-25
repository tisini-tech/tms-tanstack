import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: RouteComponent,
})

function RouteComponent() {
  const year = new Date().getFullYear()

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex min-h-svh flex-col px-6 py-8 md:px-10 md:py-10 lg:h-svh lg:min-h-0">
        <div className="flex shrink-0 justify-center md:justify-start">
          <Link to="/" className="inline-flex items-center">
            <img
              src="/tisini.png"
              alt="Tisini"
              className="h-11 w-auto object-contain md:h-12 dark:invert"
            />
          </Link>
        </div>

        <div className="flex min-h-0 flex-1 justify-center overflow-y-auto py-8 md:py-10">
          <div className="my-auto w-full max-w-md">
            <Outlet />
          </div>
        </div>

        <p className="shrink-0 text-center text-xs text-foreground/55 md:text-left">
          © {year} Tisini. All rights reserved.
        </p>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <img
          src="/auth-cover.jpg"
          alt="Live sports analytics dashboard"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </div>
  )
}

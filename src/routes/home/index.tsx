import { useState } from 'react'
import { Loader2Icon, LogOutIcon } from 'lucide-react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'

import { Button } from '#/components/ui/button'
import { getUserFn, logoutFn } from '#/data/auth'

export const Route = createFileRoute('/home/')({
  loader: () => getUserFn(),
  component: DashboardWelcome,
})

function DashboardWelcome() {
  const user = Route.useLoaderData()
  const navigate = useNavigate()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const firstName = user.name.trim().split(/\s+/)[0] || 'there'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logoutFn()
      await router.invalidate()
      await navigate({ to: '/login', replace: true })
    } catch {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.06_145_/0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,oklch(0.32_0.05_260_/0.35),transparent_50%)]"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <img
          src="/tisini.png"
          alt="Tisini"
          className="h-9 w-auto object-contain dark:invert"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoggingOut}
          onClick={() => void handleLogout()}
          className="h-9 gap-2 rounded-xl"
        >
          {isLoggingOut ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <LogOutIcon className="size-4" />
          )}
          Logout
        </Button>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-heading text-xs font-semibold tracking-[0.2em] text-accent-foreground uppercase">
            Coming soon
          </p>
          <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Welcome {firstName} — be inspired by numbers
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground text-pretty">
            Everything else will be ready soon. We are working toward ensuring
            you experience the best user experience.
          </p>
        </div>
      </main>
    </div>
  )
}

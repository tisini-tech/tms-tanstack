import { useEffect } from 'react'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'

import { cn } from '#/lib/utils'
import { getAuthContextFn } from '#/data/auth'
import { Separator } from '#/components/ui/separator'
import { AppSidebar } from '#/components/sidebar/app-sidebar'
import { isCompetitionModulePath } from '#/lib/competition-context'
import { CompetitionContextSwitcher } from '#/components/competitions/competition-context-switcher'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '#/components/ui/sidebar'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async () => {
    const { user, modules, role } = await getAuthContextFn()
    return { user, modules, role }
  },
  component: RouteComponent,
})

function isFocusLayoutPath(pathname: string) {
  return (
    pathname === '/articles/create' ||
    pathname.startsWith('/articles/create/') ||
    /\/articles\/[^/]+\/edit\/?$/.test(pathname)
  )
}

/** Collapse the app sidebar when entering immersive editor routes. */
function FocusLayoutSidebarSync({ active }: { active: boolean }) {
  const { setOpen, isMobile } = useSidebar()

  useEffect(() => {
    if (active && !isMobile) {
      setOpen(false)
    }
  }, [active, isMobile, setOpen])

  return null
}

function RouteComponent() {
  const { user, modules } = Route.useRouteContext()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const focusLayout = isFocusLayoutPath(pathname)
  const showCompetitionContext = isCompetitionModulePath(pathname)

  return (
    <SidebarProvider defaultOpen={!focusLayout}>
      <FocusLayoutSidebarSync active={focusLayout} />
      <AppSidebar user={user} modules={modules} />

      <SidebarInset
        className={cn(focusLayout && 'min-h-svh lg:h-svh lg:overflow-hidden')}
      >
        {!focusLayout ? (
          <header className="flex min-h-14 shrink-0 items-start transition-[width,height] ease-linear sm:h-16 sm:items-center group-has-data-[collapsible=icon]/sidebar-wrapper:sm:h-12">
            <div className="flex min-w-0 flex-1 flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:gap-2 sm:px-4 sm:py-0">
              <div className="flex shrink-0 items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 hidden data-[orientation=vertical]:h-4 sm:block"
                />
              </div>
              {showCompetitionContext ? <CompetitionContextSwitcher /> : null}
            </div>
          </header>
        ) : null}

        <div
          className={cn(
            'flex min-h-0 min-w-0 flex-1 flex-col',
            focusLayout
              ? 'overflow-y-auto lg:overflow-hidden'
              : 'gap-4 overflow-x-hidden p-4 pt-0',
          )}
        >
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

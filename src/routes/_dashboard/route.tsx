import { useEffect } from 'react'
import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'

import { getAuthContextFn } from '#/data/auth'
import { Separator } from '#/components/ui/separator'
import { AppSidebar } from '#/components/sidebar/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '#/components/ui/sidebar'
import { cn } from '#/lib/utils'

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

  return (
    <SidebarProvider defaultOpen={!focusLayout}>
      <FocusLayoutSidebarSync active={focusLayout} />
      <AppSidebar user={user} modules={modules} />

      <SidebarInset
        className={cn(
          focusLayout && 'min-h-svh lg:h-svh lg:overflow-hidden',
        )}
      >
        {!focusLayout ? (
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
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

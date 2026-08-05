import { useEffect, useMemo, useState } from 'react'
import { useRouterState } from '@tanstack/react-router'

import { NavUser } from '@/components/sidebar/nav-user'
import { ModuleSwitcher } from './module-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

import type { Module, User } from '#/lib/types'
import { rememberLastModulePath } from '#/lib/last-module'
import {
  competitionNavItems,
  contentNavItems,
  getModuleNavKey,
  getSiteModules,
  navItems,
  superAgentNavItems,
} from './nav-data'
import { NavPrimary } from './nav-primary'

export function AppSidebar({
  user,
  modules: allowedModules,
}: {
  user: User
  modules: Module[]
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const modules = useMemo(
    () => getSiteModules(allowedModules),
    [allowedModules],
  )

  useEffect(() => {
    rememberLastModulePath(pathname)
  }, [pathname])

  const initialModule = useMemo(() => {
    const match = modules.find(
      (m) => pathname === m.url || pathname.startsWith(m.url + '/'),
    )
    return match ?? modules[0]
  }, [modules, pathname])

  const [activeModule, setActiveModule] = useState(initialModule)

  const resolvedActive =
    modules.find(
      (m) => pathname === m.url || pathname.startsWith(`${m.url}/`),
    ) ??
    modules.find((m) => m.name === activeModule?.name) ??
    initialModule

  const activeItems = useMemo(() => {
    if (!resolvedActive) return navItems

    const navKey = getModuleNavKey(resolvedActive.name)
    if (navKey === 'administration') {
      return [...superAgentNavItems, ...navItems]
    }
    if (navKey === 'competition') {
      return [...competitionNavItems, ...navItems]
    }
    if (navKey === 'content') {
      return [...contentNavItems, ...navItems]
    }
    return [...navItems]
  }, [resolvedActive])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {resolvedActive ? (
          <ModuleSwitcher
            modules={modules}
            activeModule={resolvedActive}
            setActiveModule={setActiveModule}
          />
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        <NavPrimary items={activeItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

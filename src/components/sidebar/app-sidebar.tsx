import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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

import type { Module, NavItem, User } from '#/lib/types'
import { rememberLastModulePath } from '#/lib/modules'
import {
  resolveCompetition,
  resolveCompetitionFilters,
} from '#/lib/competition-context'
import { competitionQueryOptions } from '#/data/competitions'
import {
  competitionNavItems,
  contentNavItems,
  getModuleNavKey,
  getSiteModules,
  walletNavItems,
} from './nav-data'
import { NavPrimary } from './nav-primary'

function itemVisibleToRole(
  item: NavItem,
  role: string | number | null | undefined,
) {
  if (!item.roles?.length) return true
  return item.roles.includes(String(role ?? ''))
}

function navItemsForModule(navKey: string | undefined): NavItem[] {
  switch (navKey) {
    case 'competition':
      return competitionNavItems
    case 'content':
      return contentNavItems
    case 'wallet':
      return walletNavItems
    default:
      return []
  }
}

export function AppSidebar({
  user,
  modules: allowedModules,
  role,
}: {
  user: User
  modules: Module[]
  role: string | number | null | undefined
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const search = useRouterState({
    select: (s) => s.location.search,
  }) as {
    seasonId?: number
    divisionId?: number
    categoryId?: number
  }
  const modules = useMemo(
    () => getSiteModules(allowedModules),
    [allowedModules],
  )
  const { data: competitions = [] } = useQuery(competitionQueryOptions)
  const resolved = resolveCompetition(competitions, pathname)
  const compId = resolved ? String(resolved.id) : null
  const filters = resolved
    ? resolveCompetitionFilters(resolved, search)
    : undefined

  useEffect(() => {
    rememberLastModulePath(`${pathname}${window.location.search}`)
  }, [pathname, search])

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
    const navKey = resolvedActive
      ? getModuleNavKey(resolvedActive.name)
      : undefined
    return navItemsForModule(navKey).filter((item) =>
      itemVisibleToRole(item, role),
    )
  }, [resolvedActive, role])

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
        <NavPrimary items={activeItems} compId={compId} filters={filters} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

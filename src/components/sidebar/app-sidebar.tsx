import { NavUser } from '@/components/sidebar/nav-user'
import { ModuleSwitcher } from './module-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

import type { User } from '#/lib/types'
import { superAgentNavItems, siteModules, navItems } from './nav-data'
import { NavPrimary } from './nav-primary'
import React, { useMemo } from 'react'

export function AppSidebar({ user }: { user: User }) {
  const [activeModule, setActiveModule] = React.useState(siteModules[0])

  const activeItems = useMemo(() => {
    if (activeModule.name === 'Super Agent') {
      return [...superAgentNavItems, ...navItems]
    }

    return [...navItems]
  }, [activeModule])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ModuleSwitcher
          modules={siteModules}
          activeModule={activeModule}
          setActiveModule={setActiveModule}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavPrimary items={activeItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

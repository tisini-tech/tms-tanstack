import {
  BarChartIcon,
  CalendarIcon,
  FileTextIcon,
  GalleryVerticalEndIcon,
  GroupIcon,
  HomeIcon,
  TrophyIcon,
  UserIcon,
  WalletIcon,
} from 'lucide-react'
import { linkOptions } from '@tanstack/react-router'

import { MODULE_ROUTES } from '#/lib/module-routes'
import type { Module, NavItem, SiteModule } from '#/lib/types'

const moduleMeta: Record<
  string,
  { logo: React.ReactNode; nav: 'administration' | 'competition' | 'content' }
> = {
  Competition: {
    logo: <TrophyIcon />,
    nav: 'competition',
  },
  Content: {
    logo: <FileTextIcon />,
    nav: 'content',
  },
  Administration: {
    logo: <GalleryVerticalEndIcon />,
    nav: 'administration',
  },
}

/** Map session/API modules → sidebar modules (drop unknown names). */
export function getSiteModules(allowed: Module[]): SiteModule[] {
  return allowed.flatMap((mod) => {
    const meta = moduleMeta[mod.name]
    const url = MODULE_ROUTES[mod.name]
    if (!meta || !url) return []

    return [
      {
        id: mod.id,
        name: mod.name,
        displayName: mod.display_name || mod.name,
        logo: meta.logo,
        url,
      },
    ]
  })
}

export function getModuleNavKey(name: string) {
  return moduleMeta[name]?.nav
}

export const navItems: NavItem[] = [
  {
    to: '/wallet',
    label: 'Wallet',
    icon: WalletIcon,
    activeOptions: { exact: true },
  },
]

export const competitionNavItems: NavItem[] = [
  {
    to: '/competitions',
    label: 'Overview',
    icon: HomeIcon,
    activeOptions: { exact: true },
  },
  {
    to: '/competitions/$compId/fixtures',
    label: 'Fixtures',
    icon: CalendarIcon,
    activeOptions: { exact: false },
    needsCompId: true,
  },
  {
    to: '/competitions/$compId/teams',
    label: 'Teams',
    icon: GroupIcon,
    activeOptions: { exact: false },
    needsCompId: true,
  },
  {
    to: '/competitions/$compId/players',
    label: 'Players',
    icon: UserIcon,
    activeOptions: { exact: false },
    needsCompId: true,
  },
  {
    to: '/competitions/$compId/stats',
    label: 'Stats',
    icon: BarChartIcon,
    activeOptions: { exact: false },
    needsCompId: true,
  },
]

export const contentNavItems: NavItem[] = linkOptions([
  {
    to: '/articles',
    label: 'Articles',
    icon: FileTextIcon,
    activeOptions: { exact: false },
  },
])

import {
  AudioLinesIcon,
  CalendarIcon,
  GalleryVerticalEndIcon,
  GroupIcon,
  HomeIcon,
  TerminalIcon,
  TrophyIcon,
  UserIcon,
  WalletIcon,
} from 'lucide-react'
import { linkOptions } from '@tanstack/react-router'
import type { Module, NavItem } from '#/lib/types'

export const siteModules: Module[] = [
  {
    name: 'Super Agent',
    logo: <GalleryVerticalEndIcon />,
    plan: 'Enterprise',
    url: '/super-agent',
  },
  {
    name: 'Teams',
    logo: <AudioLinesIcon />,
    plan: 'Startup',
    url: '/teams',
  },
  {
    name: 'Admin',
    logo: <TerminalIcon />,
    plan: 'Free',
    url: '/admin',
  },
]

export const navItems: NavItem[] = [
  {
    to: '/wallet',
    label: 'Wallet',
    icon: WalletIcon,
    activeOptions: { exact: true },
  },
]

export const superAgentNavItems: NavItem[] = linkOptions([
  {
    to: '/super-agent',
    label: 'Overview',
    icon: HomeIcon,
    activeOptions: { exact: true },
  },
  {
    to: '/super-agent/competitions',
    label: 'Competitions',
    icon: TrophyIcon,
    activeOptions: { exact: false },
  },
  {
    to: '/super-agent/fixtures',
    label: 'Fixtures',
    icon: CalendarIcon,
    activeOptions: { exact: false },
  },
  {
    to: '/super-agent/teams',
    label: 'Teams',
    icon: GroupIcon,
    activeOptions: { exact: false },
  },
  {
    to: '/super-agent/players',
    label: 'Players',
    icon: UserIcon,
    activeOptions: { exact: false },
  },
])

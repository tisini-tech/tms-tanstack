import { Link } from '@tanstack/react-router'
import { ChevronsUpDownIcon } from 'lucide-react'

import type { SiteModule } from '#/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

interface ModuleSwitcherProps {
  modules: SiteModule[]
  activeModule: SiteModule
  setActiveModule: (module: SiteModule) => void
}

export function ModuleSwitcher({
  modules,
  activeModule,
  setActiveModule,
}: ModuleSwitcherProps) {
  const { isMobile } = useSidebar()

  if (!activeModule || modules.length === 0) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[popup-open]:bg-sidebar-accent data-[popup-open]:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-sidebar-border/50 transition-[width,height,padding] group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0.5">
              <img
                src="/tisini.png"
                alt="Tisini"
                className="size-8 object-contain dark:invert transition-[width,height] group-data-[collapsible=icon]:size-6"
              />
            </div>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold text-heading">
                {activeModule.displayName}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Improving African Lives
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Modules
              </DropdownMenuLabel>
              {modules.map((module, index) => (
                <DropdownMenuItem
                  key={module.id}
                  onClick={() => setActiveModule(module)}
                  className="gap-2 p-2"
                  render={<Link to={module.url} />}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    {module.logo}
                  </div>
                  {module.displayName}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

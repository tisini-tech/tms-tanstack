import { Link } from '@tanstack/react-router'
import type { NavItem } from '#/lib/types'
import type { CompetitionFilters } from '#/lib/competition-context'
import { competitionFiltersSearch } from '#/lib/competition-context'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'

interface NavPrimaryProps {
  items: Array<NavItem>
  compId?: string | null
  filters?: CompetitionFilters
}

export function NavPrimary({ items, compId, filters }: NavPrimaryProps) {
  const filterSearch = competitionFiltersSearch(filters ?? {})

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon
          const needsComp = item.needsCompId
          const disabled = Boolean(needsComp && !compId)

          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                size="sm"
                disabled={disabled}
                title={
                  disabled ? 'Select a competition first' : undefined
                }
                render={
                  disabled ? (
                    <button type="button" />
                  ) : (
                    <Link
                      to={item.to}
                      params={
                        needsComp && compId ? { compId } : undefined
                      }
                      search={
                        needsComp
                          ? (prev) => ({
                              ...prev,
                              ...filterSearch,
                            })
                          : undefined
                      }
                      activeOptions={item.activeOptions}
                      activeProps={{
                        'data-active': true,
                      }}
                    />
                  )
                }
              >
                <Icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

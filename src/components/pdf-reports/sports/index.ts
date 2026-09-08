import { footballReportModule } from '#/components/pdf-reports/sports/football-module'
import { hockeyReportModule } from '#/components/pdf-reports/sports/hockey-module'
import { createPlaceholderReportModule } from '#/components/pdf-reports/sports/placeholder-module'
import type { SportReportModule } from '#/components/pdf-reports/sports/types'
import {
  detectSport,
  type SportKind,
} from '#/lib/sports/detect-sport'

const sportReportModules: Record<SportKind, SportReportModule> = {
  football: footballReportModule,
  rugby: createPlaceholderReportModule('rugby'),
  basketball: createPlaceholderReportModule('basketball'),
  hockey: hockeyReportModule,
  handball: createPlaceholderReportModule('handball'),
}

export function getSportReportModule(
  matchType?: string | null,
): SportReportModule {
  return sportReportModules[detectSport(matchType)]
}

export function getSportReportModuleByKind(
  sport: SportKind,
): SportReportModule {
  return sportReportModules[sport]
}

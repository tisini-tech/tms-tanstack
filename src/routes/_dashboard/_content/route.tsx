import { Outlet, createFileRoute } from '@tanstack/react-router'

import { DashboardContentError } from '#/components/general/errors/dashboard-content-error'
import { DashboardContentNotFound } from '#/components/general/errors/dashboard-content-not-found'

export const Route = createFileRoute('/_dashboard/_content')({
  component: () => <Outlet />,
  errorComponent: DashboardContentError,
  notFoundComponent: DashboardContentNotFound,
})

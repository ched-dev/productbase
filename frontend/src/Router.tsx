import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthGate from './components/AuthGate'
import NavigateHelpers from './components/productbase/NavigateHelpers'
import RouteLoading from './components/RouteLoading'
import Layout from './Layout'
import { routes } from './lib/routes'

// Lazy load components for code splitting
const Home = lazy(() => import('./pages/Home'))
const OrganizationList = lazy(() => import('./pages/OrganizationList'))
const OrganizationForm = lazy(() => import('./pages/OrganizationForm'))
const OrganizationDetail = lazy(() => import('./pages/OrganizationDetail'))
const OrganizationMembers = lazy(() => import('./pages/OrganizationMembers'))

export function Router() {
  return (
    <BrowserRouter>
      <NavigateHelpers />
      <AuthGate>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route Component={Layout}>
              <Route path={routes.home.path} Component={() => <Home />} />
              <Route path={routes.organizations.list.path} Component={() => <OrganizationList />} />
              <Route path={routes.organizations.new.path} Component={() => <OrganizationForm />} />
              <Route path={routes.organizations.detail.path} Component={() => <OrganizationDetail />} />
              <Route path={routes.organizations.edit.path} Component={() => <OrganizationForm />} />
              <Route path={routes.organizations.members.path} Component={() => <OrganizationMembers />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthGate>
    </BrowserRouter>
  )
}

import { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AuthGate from './components/AuthGate'
import NavigateHelpers from './components/productbase/NavigateHelpers'
import RouteLoading from './components/RouteLoading'
import Layout from './Layout'
import { routes } from './lib/routes'

// Lazy load components for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AppHome = lazy(() => import('./pages/AppHome'))
const OrganizationList = lazy(() => import('./pages/OrganizationList'))
const OrganizationForm = lazy(() => import('./pages/OrganizationForm'))
const OrganizationDetail = lazy(() => import('./pages/OrganizationDetail'))
const OrganizationMembers = lazy(() => import('./pages/OrganizationMembers'))

export function Router() {
  return (
    <BrowserRouter>
      <NavigateHelpers />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Public routes */}
          <Route path={routes.publicLanding.path} element={<LandingPage />} />

          {/* Auth protected routes */}
          <Route Component={AuthGate}>
            <Route Component={Layout}>
              <Route path={routes.appHome.path} Component={() => <AppHome />} />
              <Route path={routes.organizations.list.path} Component={() => <OrganizationList />} />
              <Route path={routes.organizations.new.path} Component={() => <OrganizationForm />} />
              <Route path={routes.organizations.detail.path} Component={() => <OrganizationDetail />} />
              <Route path={routes.organizations.edit.path} Component={() => <OrganizationForm />} />
              <Route path={routes.organizations.members.path} Component={() => <OrganizationMembers />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

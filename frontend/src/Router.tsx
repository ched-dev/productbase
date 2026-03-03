import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Layout from './Layout'
import RouteLoading from './components/RouteLoading'
import { setNavigate } from './lib/navigate'
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
      <ExportNavigate />
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
    </BrowserRouter>
  )
}


function ExportNavigate() {
  const navigate = useNavigate();
  
  // Initialize navigate on first render
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  
  return null;
}
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Layout from './Layout'
import RouteLoading from './components/RouteLoading'
import { setNavigate } from './lib/navigate'

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
            <Route path="/" Component={() => <Home />} />
            <Route path="/organizations" Component={() => <OrganizationList />} />
            <Route path="/organizations/new" Component={() => <OrganizationForm />} />
            <Route path="/organizations/:id" Component={() => <OrganizationDetail />} />
            <Route path="/organizations/:id/edit" Component={() => <OrganizationForm />} />
            <Route path="/organizations/:id/members" Component={() => <OrganizationMembers />} />
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
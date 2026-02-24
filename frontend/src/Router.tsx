import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Layout from './Layout'
import RouteLoading from './components/RouteLoading'
import { setNavigate } from './lib/navigate'

// Lazy load components for code splitting
const Home = lazy(() => import('./pages/Home'))

export function Router() {
  return (
    <BrowserRouter>
      <ExportNavigate />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route Component={Layout}>
            <Route path="/" Component={() => <Home />} />
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
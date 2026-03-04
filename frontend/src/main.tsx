import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as config from '@/config'
import { requiredConfigCheck } from '@/config'
import App from './App'

// app wide required config values
requiredConfigCheck(config, [
  'IS_DEV',
  'IS_PROD',
  'IS_BROWSER',
  'PUBLIC_URL',
  'API_URL',
  'AUTH_COOKIE_KEY',
  'AUTH_SUPERUSER_COOKIE_KEY',
  'AUTH_COOKIE_EXPIRATION_DAYS',
  'MOCK_ACCOUNT',
])

// core query settings, can be overridden per `useQuery()`
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, retry: 1 } },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)

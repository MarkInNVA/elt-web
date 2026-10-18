import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useBrowse } from './hooks/useBrowse'
import { CompaniesPage } from './pages/CompaniesPage'
import { IssuerTradePage, PersonTradePage } from './pages/TradePage'
import { PeoplePage } from './pages/PeoplePage'
import { theme } from './theme'

const queryClient = new QueryClient()

function AppRoutes() {
  const browse = useBrowse()
  return (
    <Routes>
      <Route element={<AppShell browse={browse} />}>
        <Route index element={<CompaniesPage />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="issuer/:ticker" element={<IssuerTradePage />} />
        <Route path="person/:cik" element={<PersonTradePage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

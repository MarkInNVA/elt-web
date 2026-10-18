import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1a3a5c' },
    // System green / red (elt-ios Color.green / Color.red)
    success: { main: '#34c759' },
    error: { main: '#ff3b30' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
})

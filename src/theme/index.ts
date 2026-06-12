import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617',
      paper: '#0f172a'
    },
    primary: {
      main: '#10b981'
    },
    secondary: {
      main: '#8b5cf6'
    }
  },
  typography: {
    fontFamily: '"Inter", sans-serif'
  }
})
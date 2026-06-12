import { createTheme } from '@mui/material/styles'

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#09090b',
      paper: '#09090b'
    },
    primary: {
      main: '#fafafa'
    },
    secondary: {
      main: '#a1a1aa'
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa'
    },
    divider: '#27272a'
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 500
    }
  },
  shape: {
    borderRadius: 6
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#18181b',
          borderColor: '#27272a'
        }
      }
    }
  }
})
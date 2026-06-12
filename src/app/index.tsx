import { CssBaseline, ThemeProvider, Box } from '@mui/material'
import { HeaderSection } from '../components/headerSection'
import { ImporterSection } from '../components/importerSection'
import { DashboardSection } from '../components/dashboardSection'
import { useAppStore } from '../store/appStore'
import { darkTheme } from '../theme'
import { AppMainContainer } from './styles'

export const App = () => {
  const isImportOpen = useAppStore((state) => state.isImportOpen)

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppMainContainer>
        <HeaderSection />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
          {isImportOpen && <ImporterSection />}
          <DashboardSection />
        </Box>
      </AppMainContainer>
    </ThemeProvider>
  )
}
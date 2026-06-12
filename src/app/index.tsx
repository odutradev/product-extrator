import { CssBaseline, ThemeProvider, Box, Tabs, Tab, Snackbar, Alert } from '@mui/material'
import { TerminalSection } from '../components/terminalSection'
import { ImporterSection } from '../components/importerSection'
import { AppMainContainer, AppContentContainer } from './styles'
import { DashboardTab } from '../components/dashboardTab'
import { HeaderSection } from '../components/headerSection'
import { ProductsTab } from '../components/productsTab'
import { StatsSection } from '../components/statsSection'
import { CouponsTab } from '../components/couponsTab'
import { NumbersTab } from '../components/numbersTab'
import { useState, SyntheticEvent } from 'react'
import { useAppStore } from '../store/appStore'
import { darkTheme } from '../theme'

export const App = () => {
  const isImportOpen = useAppStore((state) => state.isImportOpen)
  const isConsoleOpen = useAppStore((state) => state.isConsoleOpen)
  const logs = useAppStore((state) => state.logs)
  
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : ''

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppMainContainer>
        <HeaderSection />
        <AppContentContainer>
          {isImportOpen && <ImporterSection />}
          <Snackbar open={!!latestLog} autoHideDuration={4000}>
            <Alert severity="info" variant="filled">{latestLog}</Alert>
          </Snackbar>
          <StatsSection />
          <Box mt={4} mb={3} borderBottom={1} borderColor="divider">
            <Tabs value={activeTab} onChange={handleTabChange} textColor="secondary" indicatorColor="secondary">
              <Tab label="Análise Competitiva" />
              <Tab label="Mapeamento de Entradas" />
              <Tab label="Vitrine de Produtos" />
              <Tab label="Cupons & Ofertas" />
            </Tabs>
          </Box>
          {activeTab === 0 && <DashboardTab />}
          {activeTab === 1 && <NumbersTab />}
          {activeTab === 2 && <ProductsTab />}
          {activeTab === 3 && <CouponsTab />}
          {isConsoleOpen && <TerminalSection />}
        </AppContentContainer>
      </AppMainContainer>
    </ThemeProvider>
  )
}
import { Typography, Button, Stack } from '@mui/material'
import { Terminal, UploadFile } from '@mui/icons-material'
import { useAppStore } from '../../store/appStore'
import { HeaderContainer, HeaderLogoBox } from './styles'

export const HeaderSection = () => {
  const toggleImport = useAppStore((state) => state.toggleImport)
  const toggleConsole = useAppStore((state) => state.toggleConsole)

  return (
    <HeaderContainer>
      <HeaderLogoBox>
        <Typography variant="h6" fontWeight="bold">
          WhatsApp Chat Parser
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Análise minimalista de grupos de ofertas
        </Typography>
      </HeaderLogoBox>
      <Stack direction="row" spacing={2}>
        <Button 
          color="secondary" 
          variant="outlined" 
          startIcon={<Terminal />} 
          onClick={toggleConsole}
        >
          Console Scraper
        </Button>
        <Button 
          color="primary" 
          variant="contained" 
          startIcon={<UploadFile />} 
          onClick={toggleImport}
        >
          Importar Arquivo
        </Button>
      </Stack>
    </HeaderContainer>
  )
}
import { TerminalContainer, TerminalHeader, LogsContainer, LogLine } from './styles'
import { Box, Typography, IconButton } from '@mui/material'
import { DeleteOutline } from '@mui/icons-material'
import { useAppStore } from '../../store/appStore'

export const TerminalSection = () => {
  const logs = useAppStore((state) => state.logs)
  const clearLogs = useAppStore((state) => state.clearLogs)

  return (
    <TerminalContainer>
      <TerminalHeader>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main', animation: 'pulse 2s infinite' }} />
          <Typography variant="caption" fontWeight="bold" color="text.secondary">Console do Web Scraper</Typography>
        </Box>
        <IconButton size="small" onClick={clearLogs} color="inherit" title="Limpar Terminal">
          <DeleteOutline fontSize="small" />
        </IconButton>
      </TerminalHeader>
      <LogsContainer>
        {logs.length === 0 && <LogLine>Aguardando disparo da esteira do robô de raspagem...</LogLine>}
        {logs.map((log, index) => (
          <LogLine key={index}>&gt; {log}</LogLine>
        ))}
      </LogsContainer>
    </TerminalContainer>
  )
}
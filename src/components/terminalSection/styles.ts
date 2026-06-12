import { styled } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

export const TerminalContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginTop: theme.spacing(4),
  padding: theme.spacing(2),
  flexDirection: 'column',
  gap: theme.spacing(2),
  backgroundColor: '#000',
  display: 'flex'
}))

export const TerminalHeader = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(1),
  justifyContent: 'space-between',
  alignItems: 'center',
  display: 'flex'
}))

export const LogsContainer = styled(Box)(({ theme }) => ({
  gap: theme.spacing(0.5),
  flexDirection: 'column',
  overflowY: 'auto',
  maxHeight: 200,
  display: 'flex'
}))

export const LogLine = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFamily: 'monospace',
  fontSize: '0.75rem'
}))
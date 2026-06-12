import { Card, Typography, Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const DashCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#18181b',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  borderRadius: '6px'
}))

export const DashTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: theme.spacing(1.5),
  fontWeight: 500,
  fontSize: '0.7rem'
}))

export const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  width: '100%'
}))

export const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(1),
  fontSize: '0.75rem'
}))

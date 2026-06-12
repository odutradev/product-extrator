import { styled } from '@mui/material/styles'
import { Card, Typography, Box } from '@mui/material'

export const DashCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%'
}))

export const DashTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  marginBottom: theme.spacing(1),
  fontWeight: 600,
  fontSize: '0.75rem'
}))

export const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  width: '100%'
}))

export const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  marginTop: theme.spacing(1),
  fontSize: '0.65rem'
}))

export const ListContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  marginTop: theme.spacing(2)
}))

export const ListItemBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
})
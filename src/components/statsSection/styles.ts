import { styled } from '@mui/material/styles'
import { Typography } from '@mui/material'

export const StatTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  fontWeight: 600,
  fontSize: '0.75rem'
}))

export const StatValuePrimary = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginTop: theme.spacing(1),
  fontWeight: 'bold',
  fontSize: '2rem'
}))

export const StatValueInfo = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  marginTop: theme.spacing(1),
  fontWeight: 'bold',
  fontSize: '2rem'
}))

export const StatValueWarning = styled(Typography)(({ theme }) => ({
  color: theme.palette.warning.main,
  marginTop: theme.spacing(1),
  fontWeight: 'bold',
  fontSize: '2rem'
}))

export const StatValueText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2),
  fontWeight: 'bold',
  fontSize: '0.875rem'
}))
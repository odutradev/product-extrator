import { styled } from '@mui/material/styles'
import { Typography } from '@mui/material'

export const StatTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  fontWeight: 500,
  fontSize: '0.7rem'
}))

export const StatValuePrimary = styled(Typography)(({ theme }) => ({
  fontFeatureSettings: '"tnum"',
  color: theme.palette.text.primary,
  marginTop: theme.spacing(1),
  fontWeight: 600,
  fontSize: '1.75rem'
}))

export const StatValueInfo = styled(Typography)(({ theme }) => ({
  fontFeatureSettings: '"tnum"',
  color: theme.palette.text.primary,
  marginTop: theme.spacing(1),
  fontWeight: 600,
  fontSize: '1.75rem'
}))

export const StatValueWarning = styled(Typography)(({ theme }) => ({
  fontFeatureSettings: '"tnum"',
  color: theme.palette.text.primary,
  marginTop: theme.spacing(1),
  fontWeight: 600,
  fontSize: '1.75rem'
}))

export const StatValueText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(2.5),
  fontWeight: 500,
  fontSize: '0.8rem'
}))
import { Typography, Box } from '@mui/material'
import { styled } from '@mui/material/styles'

export const ChartWrapper = styled(Box)({
  width: '100%',
  marginTop: '8px'
})

export const NoDataLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textAlign: 'center',
  padding: theme.spacing(4),
  fontSize: '0.875rem'
}))

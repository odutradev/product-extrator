import { styled } from '@mui/material/styles'
import { Box, Card } from '@mui/material'

export const ActionBar = styled(Box)(({ theme }) => ({
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  display: 'flex'
}))

export const CouponCard = styled(Card)(({ theme }) => ({
  borderColor: theme.palette.warning.dark,
  height: '100%'
}))
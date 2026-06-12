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

export const ScrapeControlBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(15, 23, 42, 0.4)',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(4),
  justifyContent: 'space-between',
  padding: theme.spacing(3),
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  display: 'flex'
}))

export const ProductCard = styled(Card)({
  flexDirection: 'column',
  display: 'flex',
  height: '100%'
})
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
  backgroundColor: '#18181b',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  justifyContent: 'space-between',
  padding: theme.spacing(2.5, 3),
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  display: 'flex'
}))

export const ProductCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#18181b',
  border: `1px solid ${theme.palette.divider}`,
  flexDirection: 'column',
  display: 'flex',
  height: '100%'
}))
import { styled } from '@mui/material/styles'
import { Box, Card, CardContent } from '@mui/material'

export const CardWrapper = styled(Card)(({ theme }) => ({
  backgroundColor: '#18181b',
  border: `1px solid ${theme.palette.divider}`,
  flexDirection: 'column',
  display: 'flex',
  height: '100%'
}))

export const CardBody = styled(CardContent)({
  flexGrow: 1
})

export const CardActionBar = styled(Box)(({ theme }) => ({
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(0.5, 1),
  justifyContent: 'flex-end',
  display: 'flex',
  gap: theme.spacing(0.5)
}))

export const CategoryChipRow = styled(Box)(({ theme }) => ({
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(0.5)
}))

import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

export const ActionBar = styled(Box)(({ theme }) => ({
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  alignItems: 'center',
  flexWrap: 'wrap',
  display: 'flex'
}))

export const TableContainerBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflowX: 'auto'
}))
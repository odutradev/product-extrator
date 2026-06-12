import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

export const HeaderContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  alignItems: 'center',
  position: 'sticky',
  display: 'flex',
  zIndex: 50,
  top: 0
}))

export const HeaderLogoBox = styled(Box)({
  flexDirection: 'column',
  display: 'flex'
})
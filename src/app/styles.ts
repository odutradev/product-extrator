import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

export const AppMainContainer = styled(Box)({
  flexDirection: 'column',
  display: 'flex',
  height: '100vh',
  width: '100vw'
})

export const AppContentContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(3),
  overflowY: 'auto',
  flexGrow: 1
}))
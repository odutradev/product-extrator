import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

export const DropzoneContainer = styled(Box)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  padding: theme.spacing(1, 0)
}))

export const UploadBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#18181b',
  border: `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  flexDirection: 'column',
  padding: theme.spacing(5),
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  '&:hover': {
    borderColor: '#fafafa'
  }
}))
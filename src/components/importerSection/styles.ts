import { styled } from '@mui/material/styles'
import { Box } from '@mui/material'

export const DropzoneContainer = styled(Box)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  padding: theme.spacing(2)
}))

export const UploadBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(16, 185, 129, 0.05)',
  border: `2px dashed rgba(16, 185, 129, 0.3)`,
  borderRadius: theme.shape.borderRadius * 2,
  flexDirection: 'column',
  padding: theme.spacing(6),
  alignItems: 'center',
  cursor: 'pointer',
  display: 'flex',
  '&:hover': {
    borderColor: 'rgba(16, 185, 129, 0.6)'
  }
}))
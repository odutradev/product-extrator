import { ChangeEvent, useRef } from 'react'
import { CloudUpload } from '@mui/icons-material'
import { Typography } from '@mui/material'

import { useWhatsAppActions } from '../../hooks/useWhatsAppActions'

import { DropzoneContainer, UploadBox } from './styles'

export const ImporterSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { handleImportText } = useWhatsAppActions()

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    
    if (!file) {
      return
    }

    const reader = new FileReader()
    
    reader.onload = (e) => {
      const content = e.target?.result as string
      
      if (!content) {
        return
      }
      
      handleImportText(content)
    }
    
    reader.readAsText(file)
  }

  const triggerInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <DropzoneContainer mb={4}>
      <input 
        type="file" 
        accept=".txt" 
        hidden 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <UploadBox onClick={triggerInput}>
        <CloudUpload color="primary" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" color="text.primary">
          Arraste seu arquivo .txt do WhatsApp aqui
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sempre validando e rejeitando itens duplicados automaticamente
        </Typography>
      </UploadBox>
    </DropzoneContainer>
  )
}
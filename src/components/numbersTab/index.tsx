import { Table, TableHead, TableBody, TableRow, TableCell, TextField, Button, Box } from '@mui/material'
import { useWhatsAppActions } from '../../hooks/useWhatsAppActions'
import { ContentCopy, Download, DeleteSweep } from '@mui/icons-material'
import { ActionBar, TableContainerBox } from './styles'
import { useAppStore } from '../../store/appStore'
import { useState } from 'react'

export const NumbersTab = () => {
  const [search, setSearch] = useState('')
  
  const parsedNumbers = useAppStore((state) => state.parsedNumbers)
  const { copyNumbersToClipboard, exportNumbersTxt, exportNumbersCsv, clearNumbers } = useWhatsAppActions()

  const filtered = parsedNumbers.filter((n) => n.clean.includes(search) || n.ddd.includes(search))

  return (
    <Box>
      <ActionBar>
        <TextField
          size="small"
          placeholder="Filtrar por DDD ou número..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
        />
        <Box display="flex" gap={2}>
          <Button variant="contained" color="primary" startIcon={<ContentCopy />} onClick={copyNumbersToClipboard}>Copiar Clean</Button>
          <Button variant="outlined" color="inherit" startIcon={<Download />} onClick={exportNumbersTxt}>Exportar TXT</Button>
          <Button variant="outlined" color="inherit" startIcon={<Download />} onClick={exportNumbersCsv}>Exportar CSV</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={clearNumbers}>Limpar Banco</Button>
        </Box>
      </ActionBar>
      <TableContainerBox>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>DDD</TableCell>
              <TableCell>Número Formatado</TableCell>
              <TableCell>Mensagem Original</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.clean}>
                <TableCell>{row.ddd}</TableCell>
                <TableCell>{row.clean}</TableCell>
                <TableCell>{row.line}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainerBox>
    </Box>
  )
}
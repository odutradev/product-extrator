import { Grid, TextField, Button, Box, Typography, LinearProgress, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { PlayArrow, Download, DeleteSweep, Stop } from '@mui/icons-material'
import { useState } from 'react'

import { useWhatsAppActions } from '../../hooks/useWhatsAppActions'
import { ProductCard } from './subcomponents/productCard'
import { ActionBar, ScrapeControlBox } from './styles'
import { useAppStore } from '../../store/appStore'

export const ProductsTab = () => {
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState('Todos')

  const parsedProducts = useAppStore((state) => state.parsedProducts)
  const { 
    isAnalyzingAll, 
    analysisProgress, 
    analyzeAllProducts, 
    stopAllProducts,
    exportProductsCsv, 
    clearProducts, 
    analyzeSingleProduct, 
    copyProductToClipboard, 
    removeProduct 
  } = useWhatsAppActions()

  const providerOrder: Record<string, number> = {
    'Mercado Livre': 1,
    'Amazon': 2,
    'Shopee': 3,
    'Outros': 4
  }

  const handleProviderChange = (_event: React.MouseEvent<HTMLElement>, newProvider: string | null) => {
    if (newProvider !== null) {
      setSelectedProvider(newProvider)
    }
  }

  const baseProducts = parsedProducts.filter((p) =>
    p.type === 'product' && (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.provider.toLowerCase().includes(search.toLowerCase())
    )
  )

  const filteredProducts = selectedProvider === 'Todos'
    ? baseProducts
    : baseProducts.filter((p) => p.provider === selectedProvider)

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const orderA = providerOrder[a.provider] ?? 99
    const orderB = providerOrder[b.provider] ?? 99
    return orderA - orderB
  })

  const progressPercent = analysisProgress.total > 0
    ? Math.round((analysisProgress.current / analysisProgress.total) * 100)
    : 0

  return (
    <Box>
      <ActionBar>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            placeholder="Procurar por título ou loja..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
          />
          <ToggleButtonGroup
            value={selectedProvider}
            exclusive
            onChange={handleProviderChange}
            size="small"
            color="primary"
          >
            <ToggleButton value="Todos">Todos</ToggleButton>
            <ToggleButton value="Mercado Livre">Mercado Livre</ToggleButton>
            <ToggleButton value="Amazon">Amazon</ToggleButton>
            <ToggleButton value="Shopee">Shopee</ToggleButton>
            <ToggleButton value="Outros">Outros</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="contained" color="info" startIcon={<Download />} onClick={exportProductsCsv}>Exportar CSV</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={clearProducts}>Limpar Tudo</Button>
        </Box>
      </ActionBar>

      <ScrapeControlBox>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">Enriquecimento de Dados Web</Typography>
          <Typography variant="body2" color="text.secondary">Varre o código-fonte do produto em segundo plano para extrair preços.</Typography>
        </Box>
        <Button
          variant="contained"
          color={isAnalyzingAll ? "error" : "secondary"}
          startIcon={isAnalyzingAll ? <Stop /> : <PlayArrow />}
          onClick={isAnalyzingAll ? stopAllProducts : analyzeAllProducts}
        >
          {isAnalyzingAll ? 'Parar Auto-Scrape' : 'Auto-Scrape Todos (ML)'}
        </Button>
      </ScrapeControlBox>

      {isAnalyzingAll && (
        <Box mb={4} p={2.5} sx={{ backgroundColor: '#18181b', borderRadius: 1, border: '1px solid #27272a' }}>
          <Box display="flex" justifyContent="space-between" mb={1} alignItems="center">
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
              Progresso do Auto-Scrape
            </Typography>
            <Typography variant="body2" color="secondary" fontWeight="bold">{progressPercent}%</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            A processar o item {analysisProgress.current} de {analysisProgress.total}...
          </Typography>
          <LinearProgress variant="determinate" value={progressPercent} color="secondary" sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      )}

      <Grid container spacing={3}>
        {sortedProducts.map((p) => (
          <Grid item xs={12} md={6} key={p.id}>
            <ProductCard
              product={p}
              onScrape={analyzeSingleProduct}
              onCopy={copyProductToClipboard}
              onRemove={removeProduct}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
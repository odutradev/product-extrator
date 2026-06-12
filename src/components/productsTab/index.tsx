import { Grid, TextField, Button, Box, Typography, LinearProgress, CardContent, Link } from '@mui/material'
import { PlayArrow, Download, DeleteSweep } from '@mui/icons-material'
import { ActionBar, ScrapeControlBox, ProductCard } from './styles'
import { useWhatsAppActions } from '../../hooks/useWhatsAppActions'
import { useAppStore } from '../../store/appStore'
import { useState } from 'react'

export const ProductsTab = () => {
  const [search, setSearch] = useState('')
  
  const parsedProducts = useAppStore((state) => state.parsedProducts)
  const { isAnalyzingAll, analysisProgress, analyzeAllProducts, exportProductsCsv, clearProducts } = useWhatsAppActions()

  const products = parsedProducts.filter((p) => p.type === 'product' && (p.title.toLowerCase().includes(search.toLowerCase()) || p.provider.toLowerCase().includes(search.toLowerCase())))
  const progressPercent = analysisProgress.total > 0 ? Math.round((analysisProgress.current / analysisProgress.total) * 100) : 0

  return (
    <Box>
      <ActionBar>
        <TextField
          size="small"
          placeholder="Buscar por título ou loja..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
        />
        <Box display="flex" gap={2}>
          <Button variant="contained" color="info" startIcon={<Download />} onClick={exportProductsCsv}>Exportar CSV</Button>
          <Button variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={clearProducts}>Limpar</Button>
        </Box>
      </ActionBar>

      <ScrapeControlBox>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">Enriquecimento de Dados Web</Typography>
          <Typography variant="body2" color="text.secondary">Varre o código fonte do produto em segundo plano para extrair preços.</Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<PlayArrow />}
          onClick={analyzeAllProducts}
          disabled={isAnalyzingAll}
        >
          {isAnalyzingAll ? 'Analisando...' : 'Auto-Scrape Todos (ML)'}
        </Button>
      </ScrapeControlBox>

      {isAnalyzingAll && (
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">Analisando item {analysisProgress.current} de {analysisProgress.total}...</Typography>
            <Typography variant="body2" color="secondary" fontWeight="bold">{progressPercent}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progressPercent} color="secondary" />
        </Box>
      )}

      <Grid container spacing={3}>
        {products.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <ProductCard variant="outlined">
              <CardContent>
                <Typography variant="caption" color="primary" fontWeight="bold">{p.provider}</Typography>
                <Typography variant="subtitle2" fontWeight="bold" noWrap title={p.title}>{p.title}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>Preço Original: {p.price || 'N/A'}</Typography>
                {p.categorized && (
                  <Typography variant="body2" color="secondary" fontWeight="bold" mt={1}>Preço Web: {p.categorized.price || 'N/A'}</Typography>
                )}
                <Box mt={2}>
                  <Link href={p.link} target="_blank" rel="noopener" color="inherit" variant="caption">Acessar Link original</Link>
                </Box>
              </CardContent>
            </ProductCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
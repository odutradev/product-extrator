import { DashCard, DashTitle, ProgressContainer, StatLabel, ListContainer, ListItemBox } from './styles'
import { Grid, Typography, LinearProgress, Box } from '@mui/material'
import { useWhatsAppActions } from '../../hooks/useWhatsAppActions'

export const DashboardTab = () => {
  const { dashboardStats } = useWhatsAppActions()
  const { avgGeneral, totalScrapeCount, totalCount, dominantStore, dominantCount, storeCounts, storePrices, priceRanges, generalCategories, mainCategories } = dashboardStats

  const scrapePercent = totalCount > 0 ? (totalScrapeCount / totalCount) * 100 : 0
  const efficiency = totalCount > 0 ? ((totalScrapeCount / totalCount) * 100).toFixed(1) : '0'
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <DashCard variant="outlined">
          <DashTitle>Ticket Médio Geral</DashTitle>
          <Typography variant="h5" color="primary.main" fontWeight="bold">{formatCurrency(avgGeneral)}</Typography>
        </DashCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <DashCard variant="outlined">
          <DashTitle>Produtos Scrapeados</DashTitle>
          <Typography variant="h5" color="secondary.main" fontWeight="bold">{totalScrapeCount} / {totalCount}</Typography>
          <ProgressContainer>
            <LinearProgress variant="determinate" value={scrapePercent} color="secondary" />
          </ProgressContainer>
        </DashCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <DashCard variant="outlined">
          <DashTitle>Competidor Dominante</DashTitle>
          <Typography variant="h5" color="info.main" fontWeight="bold">{dominantStore}</Typography>
          <StatLabel>{dominantCount} anúncios</StatLabel>
        </DashCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <DashCard variant="outlined">
          <DashTitle>Eficiência de Catálogo</DashTitle>
          <Typography variant="h5" color="warning.main" fontWeight="bold">{efficiency}%</Typography>
          <StatLabel>Taxa de enriquecimento</StatLabel>
        </DashCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashCard variant="outlined">
          <DashTitle>Share por Competidor</DashTitle>
          <ListContainer>
            {Object.entries(storeCounts).map(([store, count]) => (
              <ListItemBox key={store}>
                <Typography variant="body2">{store} ({count})</Typography>
                <LinearProgress variant="determinate" value={totalCount > 0 ? (count / totalCount) * 100 : 0} />
              </ListItemBox>
            ))}
          </ListContainer>
        </DashCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashCard variant="outlined">
          <DashTitle>Ticket Médio por Competidor</DashTitle>
          <ListContainer>
            {Object.entries(storePrices).map(([store, data]) => (
              <ListItemBox key={store}>
                <Typography variant="body2">{store}</Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">{formatCurrency(data.count > 0 ? data.total / data.count : 0)}</Typography>
              </ListItemBox>
            ))}
          </ListContainer>
        </DashCard>
      </Grid>

      <Grid item xs={12}>
        <DashCard variant="outlined">
          <DashTitle>Distribuição por Faixas de Preço</DashTitle>
          <Box display="flex" justifyContent="space-between" mt={2} gap={2}>
            {Object.entries(priceRanges).map(([range, count]) => (
              <Box key={range} flex={1} textAlign="center">
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>{range}</Typography>
                <Typography variant="h6" color="info.main">{count}</Typography>
              </Box>
            ))}
          </Box>
        </DashCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashCard variant="outlined">
          <DashTitle>Top Categorias Gerais</DashTitle>
          <ListContainer>
            {Object.entries(generalCategories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => (
              <ListItemBox key={cat}>
                <Typography variant="body2" noWrap title={cat}>{cat}</Typography>
                <Typography variant="caption">{count} itens</Typography>
              </ListItemBox>
            ))}
          </ListContainer>
        </DashCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashCard variant="outlined">
          <DashTitle>Top Categorias Principais</DashTitle>
          <ListContainer>
            {Object.entries(mainCategories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cat, count]) => (
              <ListItemBox key={cat}>
                <Typography variant="body2" noWrap title={cat}>{cat}</Typography>
                <Typography variant="caption">{count} itens</Typography>
              </ListItemBox>
            ))}
          </ListContainer>
        </DashCard>
      </Grid>
    </Grid>
  )
}
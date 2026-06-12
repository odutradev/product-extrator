import { CompetitorShareChart } from './competitorShareChart'
import { CompetitorTicketChart } from './competitorTicketChart'
import { PriceRangesChart } from './priceRangesChart'
import { CategoriesChart } from './categoriesChart'
import { DashCard, DashTitle, ProgressContainer, StatLabel } from './styles'
import { useWhatsAppActions } from '../../hooks/useWhatsAppActions'
import { Grid, Typography, LinearProgress } from '@mui/material'
import { formatCurrency } from './chartConfig'

export const DashboardTab = () => {
  const { dashboardStats } = useWhatsAppActions()
  const {
    avgGeneral,
    pricedCount,
    totalScrapeCount,
    totalCount,
    dominantStore,
    dominantCount,
    storeCounts,
    storePrices,
    priceRanges,
    generalCategories,
    mainCategories
  } = dashboardStats

  const scrapePercent = totalCount > 0 ? (totalScrapeCount / totalCount) * 100 : 0
  const efficiency = totalCount > 0 ? ((totalScrapeCount / totalCount) * 100).toFixed(1) : '0'

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <DashCard variant="outlined">
          <DashTitle>Ticket Médio Geral</DashTitle>
          <Typography variant="h5" color="primary.main" fontWeight="bold">
            {formatCurrency(avgGeneral)}
          </Typography>
          <StatLabel>{pricedCount} produtos com preço válido</StatLabel>
        </DashCard>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <DashCard variant="outlined">
          <DashTitle>Produtos Scrapeados</DashTitle>
          <Typography variant="h5" color="secondary.main" fontWeight="bold">
            {totalScrapeCount} / {totalCount}
          </Typography>
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
          <CompetitorShareChart storeCounts={storeCounts} />
        </DashCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashCard variant="outlined">
          <DashTitle>Ticket Médio por Competidor</DashTitle>
          <CompetitorTicketChart storePrices={storePrices} />
        </DashCard>
      </Grid>

      <Grid item xs={12}>
        <DashCard variant="outlined">
          <DashTitle>Distribuição por Faixas de Preço</DashTitle>
          <PriceRangesChart priceRanges={priceRanges} />
        </DashCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashCard variant="outlined">
          <DashTitle>Top Categorias Gerais</DashTitle>
          <CategoriesChart categories={generalCategories} color="#10b981" />
        </DashCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <DashCard variant="outlined">
          <DashTitle>Top Categorias Principais</DashTitle>
          <CategoriesChart categories={mainCategories} color="#a78bfa" />
        </DashCard>
      </Grid>
    </Grid>
  )
}

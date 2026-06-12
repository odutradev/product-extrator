import { Typography, Grid, Card, CardContent } from '@mui/material'
import { useAppStore } from '../../store/appStore'

export const DashboardSection = () => {
  const parsedNumbers = useAppStore((state) => state.parsedNumbers)
  const parsedProducts = useAppStore((state) => state.parsedProducts)

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Contatos Mapeados
            </Typography>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {parsedNumbers.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Produtos Identificados
            </Typography>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {parsedProducts.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
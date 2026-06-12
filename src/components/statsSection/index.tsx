import { StatTitle, StatValuePrimary, StatValueInfo, StatValueWarning, StatValueText } from './styles'
import { Grid, Card, CardContent } from '@mui/material'
import { useAppStore } from '../../store/appStore'

export const StatsSection = () => {
  const parsedNumbers = useAppStore((state) => state.parsedNumbers)
  const parsedProducts = useAppStore((state) => state.parsedProducts)
  const logs = useAppStore((state) => state.logs)

  const couponsCount = parsedProducts.filter((p) => p.type === 'coupon').length
  const productsCount = parsedProducts.filter((p) => p.type === 'product').length
  const latestStatus = logs.length > 0 ? logs[logs.length - 1] : 'Aguardando arquivo...'

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={3}>
        <Card variant="outlined">
          <CardContent>
            <StatTitle>Contatos Mapeados</StatTitle>
            <StatValuePrimary>{parsedNumbers.length}</StatValuePrimary>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Card variant="outlined">
          <CardContent>
            <StatTitle>Produtos Identificados</StatTitle>
            <StatValueInfo>{productsCount}</StatValueInfo>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Card variant="outlined">
          <CardContent>
            <StatTitle>Cupons Encontrados</StatTitle>
            <StatValueWarning>{couponsCount}</StatValueWarning>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={3}>
        <Card variant="outlined">
          <CardContent>
            <StatTitle>Última Importação</StatTitle>
            <StatValueText noWrap title={latestStatus}>{latestStatus}</StatValueText>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
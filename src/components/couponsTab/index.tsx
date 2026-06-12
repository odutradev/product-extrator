import { Grid, TextField, Button, Box, CardContent, Typography, Link } from '@mui/material'
import { useWhatsAppActions } from '../../hooks/useWhatsAppActions'
import { ActionBar, CouponCard } from './styles'
import { DeleteSweep } from '@mui/icons-material'
import { useAppStore } from '../../store/appStore'
import { useState } from 'react'

export const CouponsTab = () => {
  const [search, setSearch] = useState('')
  
  const parsedProducts = useAppStore((state) => state.parsedProducts)
  const { clearCoupons } = useWhatsAppActions()

  const coupons = parsedProducts.filter((p) => p.type === 'coupon' && p.headline.toLowerCase().includes(search.toLowerCase()))

  return (
    <Box>
      <ActionBar>
        <TextField
          size="small"
          placeholder="Buscar por cupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
        />
        <Button variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={clearCoupons}>Limpar Cupons</Button>
      </ActionBar>

      <Grid container spacing={3}>
        {coupons.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.id}>
            <CouponCard variant="outlined">
              <CardContent>
                <Typography variant="caption" color="warning.main" fontWeight="bold">CUPOM ENCONTRADO</Typography>
                <Typography variant="subtitle1" fontWeight="bold" mt={1}>{c.headline}</Typography>
                <Typography variant="body2" color="text.secondary" mt={1} sx={{ wordBreak: 'break-all' }}>{c.title}</Typography>
                <Box mt={2}>
                  <Link href={c.link} target="_blank" rel="noopener" color="inherit" variant="caption">Acessar Oferta</Link>
                </Box>
              </CardContent>
            </CouponCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
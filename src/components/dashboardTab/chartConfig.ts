export const PROVIDER_COLORS: Record<string, string> = {
  Amazon: '#00b2ff',
  Shopee: '#f97316',
  'Mercado Livre': '#22c55e',
  Outros: '#a1a1aa'
}

export const DEFAULT_COLORS = ['#00b2ff', '#f97316', '#22c55e', '#a855f7', '#ec4899', '#a1a1aa']

export const PRICE_RANGE_LABELS: Record<string, string> = {
  'Até R$50': '< R$50',
  'R$50 - R$150': 'R$50–150',
  'R$150 - R$500': 'R$150–500',
  'R$500 - R$1.500': 'R$500–1.5k',
  'Mais de R$1.500': '> R$1.5k'
}

export const formatCurrency = (val: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

export const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: 6 },
  labelStyle: { color: '#fafafa', fontSize: 12 },
  itemStyle: { color: '#a1a1aa', fontSize: 12 }
}

export const AXIS_TICK = { fill: '#a1a1aa', fontSize: 11 }

export const LEGEND_STYLE: React.CSSProperties = { color: '#a1a1aa', fontSize: '0.75rem', paddingTop: '8px' }

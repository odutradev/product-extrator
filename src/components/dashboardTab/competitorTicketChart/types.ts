export interface StorePriceData {
  total: number
  count: number
}

export interface CompetitorTicketChartProps {
  storePrices: Record<string, StorePriceData>
}

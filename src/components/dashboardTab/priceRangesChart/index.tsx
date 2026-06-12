import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { PRICE_RANGE_LABELS, TOOLTIP_STYLE, AXIS_TICK } from '../chartConfig'
import { ChartWrapper, NoDataLabel } from './styles'
import type { PriceRangesChartProps } from './types'

const RANGE_COLORS = ['#c4b5fd', '#a78bfa', '#8b5cf6', '#7c3aed', '#6d28d9']

export const PriceRangesChart = ({ priceRanges }: PriceRangesChartProps) => {
  const data = Object.entries(priceRanges).map(([key, count], index) => ({
    name: PRICE_RANGE_LABELS[key] ?? key,
    count,
    color: RANGE_COLORS[index] ?? '#8b5cf6'
  }))

  const hasData = data.some(({ count }) => count > 0)

  if (!hasData) return <NoDataLabel>Sem dados de faixa de preço disponíveis</NoDataLabel>

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ left: -16, right: 8, top: 4, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="#27272a" />
          <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [`${value} produtos`, 'Quantidade']} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

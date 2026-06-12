import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { PROVIDER_COLORS, DEFAULT_COLORS, TOOLTIP_STYLE, AXIS_TICK, formatCurrency } from '../chartConfig'
import { ChartWrapper, NoDataLabel } from './styles'
import type { CompetitorTicketChartProps } from './types'

const formatAxisTick = (v: number): string =>
  v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v.toFixed(0)}`

export const CompetitorTicketChart = ({ storePrices }: CompetitorTicketChartProps) => {
  const data = Object.entries(storePrices)
    .map(([name, { total, count }]) => ({
      name,
      avgTicket: count > 0 ? Math.round((total / count) * 100) / 100 : 0
    }))
    .filter(({ avgTicket }) => avgTicket > 0)
    .sort((a, b) => b.avgTicket - a.avgTicket)

  if (data.length === 0) return <NoDataLabel>Sem dados de preço disponíveis</NoDataLabel>

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#27272a" />
          <XAxis type="number" tick={AXIS_TICK} tickFormatter={formatAxisTick} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={110} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(value) => [formatCurrency(value as number), 'Ticket Médio']}
          />
          <Bar dataKey="avgTicket" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={PROVIDER_COLORS[entry.name] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

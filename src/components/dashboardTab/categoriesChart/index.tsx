import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TOOLTIP_STYLE, AXIS_TICK } from '../chartConfig'
import { ChartWrapper, NoDataLabel } from './styles'
import type { CategoriesChartProps } from './types'

export const CategoriesChart = ({ categories, color }: CategoriesChartProps) => {
  const data = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  if (data.length === 0) return <NoDataLabel>Nenhuma categoria mapeada ainda</NoDataLabel>

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
          <CartesianGrid horizontal={false} stroke="#27272a" />
          <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="name" width={140} tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [`${value} itens`, 'Total']} />
          <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

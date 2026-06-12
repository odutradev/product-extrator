import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { PROVIDER_COLORS, DEFAULT_COLORS, TOOLTIP_STYLE, LEGEND_STYLE } from '../chartConfig'
import { ChartWrapper, NoDataLabel } from './styles'
import type { CompetitorShareChartProps } from './types'

export const CompetitorShareChart = ({ storeCounts }: CompetitorShareChartProps) => {
  const data = Object.entries(storeCounts).map(([name, value]) => ({ name, value }))

  if (data.length === 0) return <NoDataLabel>Sem dados disponíveis</NoDataLabel>

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={PROVIDER_COLORS[entry.name] ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip {...TOOLTIP_STYLE} formatter={(value) => [`${value} produtos`, '']} />
          <Legend wrapperStyle={LEGEND_STYLE} />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

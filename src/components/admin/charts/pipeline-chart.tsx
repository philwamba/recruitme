'use client'

import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PipelineChartProps {
    data: Array<{
        stage: string
        count: number
    }>
}

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))',
    'hsl(var(--success))',
]

export function PipelineChart({ data }: PipelineChartProps) {
    const total = data.reduce((sum, item) => sum + item.count, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pipeline Distribution</CardTitle>
                <CardDescription>
                    {total} candidates in active pipeline stages
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                        >
                            <XAxis
                                type="number"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="stage"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 12 }}
                                width={80}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload
                                        const percentage = total > 0
                                            ? Math.round((data.count / total) * 100)
                                            : 0
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <p className="text-sm font-medium">{data.stage}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {data.count} candidates ({percentage}%)
                                                </p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar
                                dataKey="count"
                                radius={[0, 4, 4, 0]}
                            >
                                {data.map((_, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

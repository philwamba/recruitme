'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ApplicationsChartProps {
    data: Array<{
        date: string
        applications: number
    }>
}

export function ApplicationsChart({ data }: ApplicationsChartProps) {
    const total = data.reduce((sum, item) => sum + item.applications, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Applications Over Time</CardTitle>
                <CardDescription>
                    {total} applications in the last 30 days
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="applicationsFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="hsl(var(--primary))"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 12 }}
                                tickFormatter={value => format(parseISO(value), 'MMM d')}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid gap-1">
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(parseISO(payload[0].payload.date), 'MMM d, yyyy')}
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {payload[0].value} applications
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="applications"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                fill="url(#applicationsFill)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

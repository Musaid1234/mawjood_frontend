import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ViewsTrend {
    date: string;
    count: number;
}

interface ViewsChartProps {
    data: ViewsTrend[];
}

export default function ViewsChart({ data }: ViewsChartProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle>Views Trend (Last 7 Days)</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis />
                            <Tooltip
                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                formatter={(value: number) => [`${value} views`, 'Views']}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#1c4233"
                                strokeWidth={2}
                                dot={{ fill: '#1c4233', r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-gray-500">
                        No views data available
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BusinessGrowthChartProps {
  data: Array<{
    month: string;
    year: number;
    count: number;
  }>;
}

export default function BusinessGrowthChart({ data }: BusinessGrowthChartProps) {
  // Safety check for data
  const safeData = Array.isArray(data) ? data.filter(item => item && item.month && typeof item.count === 'number') : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#1c4233]" />
          <CardTitle>Business Growth (Last 6 Months)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {safeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={safeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                formatter={(value: number) => [`${value} businesses`, 'Count']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1c4233"
                strokeWidth={2}
                dot={{ fill: '#1c4233', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No growth data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}


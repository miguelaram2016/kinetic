'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeightEntry } from '@/lib/types';

interface WeightChartProps {
  entries: WeightEntry[];
}

export default function WeightChart({ entries }: WeightChartProps) {
  if (entries.length === 0) {
    return null;
  }

  const data = entries.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
  }));

  const minWeight = Math.min(...entries.map(e => e.weight));
  const maxWeight = Math.max(...entries.map(e => e.weight));
  const padding = (maxWeight - minWeight) * 0.1 || 5;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9CA3AF" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#9CA3AF" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
          domain={[minWeight - padding, maxWeight + padding]}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1F2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#fff'
          }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#6366F1" 
          strokeWidth={2}
          dot={{ fill: '#6366F1', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: '#818CF8' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

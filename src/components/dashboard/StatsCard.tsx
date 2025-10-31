import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon: Icon, colorClass, subtitle }: StatsCardProps) {
  return (
<Card className={`${colorClass} text-white border-0 py-3 gap-3`}>
    <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-md font-medium text-white/90">
          {title}
        </CardTitle>
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent >
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-white/80 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
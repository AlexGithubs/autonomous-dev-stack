import { ArrowUpRight, ArrowDownRight, Users, DollarSign, Activity, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  trend: number
  icon: 'users' | 'dollar' | 'activity' | 'percent'
}

const icons = {
  users: Users,
  dollar: DollarSign,
  activity: Activity,
  percent: Percent
}

export function StatsCard({ title, value, trend, icon }: StatsCardProps) {
  const Icon = icons[icon]
  const isPositive = trend > 0

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className={cn(
          'flex items-center text-sm font-medium',
          isPositive ? 'text-green-600' : 'text-red-600'
        )}>
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          )}
          {Math.abs(trend)}%
        </div>
      </div>
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  )
}

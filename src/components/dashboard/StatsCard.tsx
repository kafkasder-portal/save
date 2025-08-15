import { memo } from 'react'
import { LucideIcon } from 'lucide-react'
import { Badge } from '../ui/Badge'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
    timeframe: string
  }
  icon: LucideIcon
  iconColor?: string
  description?: string
  trend?: {
    data: number[]
    positive: boolean
  }
}

export const StatsCard = memo(function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-blue-600',
  description,
  trend
}: StatsCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString('tr-TR')
    }
    return val
  }

  const getChangeColor = (type: 'increase' | 'decrease') => {
    return type === 'increase' ? 'text-green-600' : 'text-red-600'
  }

  const getChangeIcon = (type: 'increase' | 'decrease') => {
    return type === 'increase' ? '↗' : '↘'
  }

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gray-100 dark:bg-gray-700 rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center">
            <div className={`w-16 h-8 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
              {/* Simple trend visualization */}
              <svg className="w-full h-full" viewBox="0 0 64 32">
                <polyline
                  points={trend.data.map((val, i) => 
                    `${(i / (trend.data.length - 1)) * 64},${32 - (val / Math.max(...trend.data)) * 32}`
                  ).join(' ')}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatValue(value)}
          </span>
          
          {change && (
            <Badge 
              variant={change.type === 'increase' ? 'success' : 'destructive'}
              className="text-xs"
            >
              {getChangeIcon(change.type)} {Math.abs(change.value)}%
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          {description && (
            <p className="text-sm text-gray-500">
              {description}
            </p>
          )}
          
          {change && (
            <p className="text-xs text-gray-500">
              {change.timeframe}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})

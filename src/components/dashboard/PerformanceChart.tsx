import { memo, useState } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface PerformanceChartProps {
  title: string
  data: ChartData[]
  type?: 'bar' | 'line' | 'pie'
  timeframe?: string
  total?: number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
}

export const PerformanceChart = memo(function PerformanceChart({
  title,
  data,
  type = 'bar',
  timeframe = 'Son 7 gün',
  total,
  change
}: PerformanceChartProps) {
  const [chartType, setChartType] = useState(type)

  const maxValue = Math.max(...data.map(d => d.value))
  
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-pink-500'
  ]

  const renderBarChart = () => (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.label} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {item.value.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-700 ${
                item.color || colors[index % colors.length]
              }`}
              style={{
                width: `${(item.value / maxValue) * 100}%`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )

  const renderLineChart = () => (
    <div className="h-32 flex items-end justify-between gap-2">
      {data.map((item, index) => (
        <div
          key={item.label}
          className="flex-1 flex flex-col items-center space-y-2"
        >
          <div
            className={`w-full ${
              item.color || colors[index % colors.length]
            } transition-all duration-700 rounded-t`}
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              minHeight: '4px'
            }}
          />
          <span className="text-xs text-gray-500 text-center">
            {item.label}
          </span>
          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )

  const renderPieChart = () => {
    const totalValue = data.reduce((sum, item) => sum + item.value, 0)
    let cumulativePercentage = 0

    return (
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 32 32">
            {data.map((item, index) => {
              const percentage = (item.value / totalValue) * 100
              const strokeDasharray = `${percentage} ${100 - percentage}`
              const strokeDashoffset = -cumulativePercentage
              cumulativePercentage += percentage

              return (
                <circle
                  key={item.label}
                  cx="16"
                  cy="16"
                  r="15.915"
                  fill="transparent"
                  stroke={`hsl(${(index * 60) % 360}, 70%, 50%)`}
                  strokeWidth="2"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              )
            })}
          </svg>
          
          {/* Legend */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {totalValue}
              </p>
              <p className="text-xs text-gray-500">Toplam</p>
            </div>
          </div>
        </div>
        
        <div className="ml-6 space-y-2">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`
                }}
              />
              <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return renderLineChart()
      case 'pie':
        return renderPieChart()
      default:
        return renderBarChart()
    }
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">{timeframe}</span>
            {change && (
              <Badge
                variant={change.type === 'increase' ? 'success' : 'destructive'}
                className="text-xs"
              >
                {change.type === 'increase' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change.value)}%
              </Badge>
            )}
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={chartType === 'bar' ? 'default' : 'ghost'}
            onClick={() => setChartType('bar')}
            className="h-8 w-8 p-0"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={chartType === 'line' ? 'default' : 'ghost'}
            onClick={() => setChartType('line')}
            className="h-8 w-8 p-0"
          >
            <LineChart className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={chartType === 'pie' ? 'default' : 'ghost'}
            onClick={() => setChartType('pie')}
            className="h-8 w-8 p-0"
          >
            <PieChart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total Value */}
      {total !== undefined && chartType !== 'pie' && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {total.toLocaleString('tr-TR')}
            </p>
            <p className="text-sm text-gray-500">Toplam</p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mb-4">
        {renderChart()}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}</span>
          <Button variant="ghost" size="sm" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            Zaman aralığını değiştir
          </Button>
        </div>
      </div>
    </div>
  )
})

import React, { ReactNode, Suspense, lazy } from 'react'

// Type for recharts components
interface RechartsComponents {
  ResponsiveContainer: any
  BarChart: any
  CartesianGrid: any
  XAxis: any
  YAxis: any
  Tooltip: any
  Bar: any
  PieChart: any
  Pie: any
  Cell: any
  AreaChart: any
  Area: any
  LineChart: any
  Line: any
  Legend: any
}

interface LazyRechartsComponentsProps {
  children: (components: RechartsComponents) => ReactNode
}

// Simple wrapper component that loads recharts components
const RechartsWrapper: React.FC<LazyRechartsComponentsProps> = ({ children }) => {
  const [components, setComponents] = React.useState<RechartsComponents | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const loadComponents = async () => {
      try {
        const recharts = await import('recharts')
        setComponents({
          ResponsiveContainer: recharts.ResponsiveContainer,
          BarChart: recharts.BarChart,
          CartesianGrid: recharts.CartesianGrid,
          XAxis: recharts.XAxis,
          YAxis: recharts.YAxis,
          Tooltip: recharts.Tooltip,
          Bar: recharts.Bar,
          PieChart: recharts.PieChart,
          Pie: recharts.Pie,
          Cell: recharts.Cell,
          AreaChart: recharts.AreaChart,
          Area: recharts.Area,
          LineChart: recharts.LineChart,
          Line: recharts.Line,
          Legend: recharts.Legend
        })
        setLoading(false)
      } catch (err) {
        setError(err as Error)
        setLoading(false)
      }
    }

    loadComponents()
  }, [])

  if (loading) {
    return <div className="flex h-64 items-center justify-center">Loading chart...</div>
  }

  if (error || !components) {
    return <div className="flex h-64 items-center justify-center text-red-500">Error loading chart components</div>
  }

  return <>{children(components)}</>
}

export const LazyRechartsComponents: React.FC<LazyRechartsComponentsProps> = ({ children }) => {
  return <RechartsWrapper>{children}</RechartsWrapper>
}

export default LazyRechartsComponents

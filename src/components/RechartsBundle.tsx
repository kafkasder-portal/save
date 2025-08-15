import React from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { TrendingUp, Users, Coins } from 'lucide-react'

interface Props {
  donationTrend: any[]
  aidDistribution: any[]
  weeklyStats: any[]
  regionalData: any[]
}

const RechartsBundle: React.FC<Props> = ({ donationTrend, aidDistribution, weeklyStats, regionalData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donation Trend */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Bağış Trendleri</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={donationTrend}>
            <defs>
              <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: any) => [
                name === 'donations' ? `₺${Number(value).toLocaleString('tr-TR')}` : value,
                name === 'donations' ? 'Bağış' : 'İhtiyaç Sahibi'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="donations" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorDonations)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Aid Distribution */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Yardım Dağılımı</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={aidDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {aidDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => [`%${value}`, 'Oran']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Activity */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Haftalık Aktivite</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyStats}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip 
              formatter={(value: any, name: any) => [
                name === 'donations' ? `₺${Number(value).toLocaleString('tr-TR')}` : value,
                name === 'donations' ? 'Bağış' : 'Başvuru'
              ]}
            />
            <Bar dataKey="applications" fill="#f59e0b" name="applications" />
            <Bar dataKey="donations" fill="#3b82f6" name="donations" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Regional Distribution */}
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Bölgesel Dağılım</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionalData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" />
            <YAxis dataKey="region" type="category" width={60} />
            <Tooltip 
              formatter={(value: any, name: any) => [
                name === 'amount' ? `₺${Number(value).toLocaleString('tr-TR')}` : value,
                name === 'amount' ? 'Tutar' : 'İhtiyaç Sahibi'
              ]}
            />
            <Bar dataKey="beneficiaries" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RechartsBundle

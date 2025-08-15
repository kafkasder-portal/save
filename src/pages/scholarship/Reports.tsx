import { useState, useMemo } from 'react'
// import { // StatCard } from '@components/// StatCard' // Removed - file deleted
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Users, GraduationCap, DollarSign, TrendingUp, Download } from 'lucide-react'
// import { exportToCsv } from '@lib/exportToCsv' // Removed - file deleted

const monthlyData = [
  { month: 'Ocak', students: 45, amount: 112500 },
  { month: 'Şubat', students: 52, amount: 130000 },
  { month: 'Mart', students: 48, amount: 120000 },
  { month: 'Nisan', students: 55, amount: 137500 },
  { month: 'Mayıs', students: 60, amount: 150000 },
  { month: 'Haziran', students: 58, amount: 145000 },
]

const scholarshipTypes = [
  { name: 'Eğitim Bursu', value: 45, color: '#3B82F6' },
  { name: 'Barınma Bursu', value: 25, color: '#10B981' },
  { name: 'Beslenme Bursu', value: 20, color: '#F59E0B' },
  { name: 'Kitap Bursu', value: 10, color: '#EF4444' },
]

const genderData = [
  { name: 'Kız', value: 60, color: '#EC4899' },
  { name: 'Erkek', value: 40, color: '#3B82F6' },
]

const performanceData = [
  { month: 'Ocak', average: 3.2 },
  { month: 'Şubat', average: 3.3 },
  { month: 'Mart', average: 3.4 },
  { month: 'Nisan', average: 3.5 },
  { month: 'Mayıs', average: 3.6 },
  { month: 'Haziran', average: 3.7 },
]

export default function ScholarshipReports() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024')
  const [reportType, setReportType] = useState('monthly')

  const totalStats = useMemo(() => {
    const totalStudents = monthlyData[monthlyData.length - 1].students
    const totalAmount = monthlyData.reduce((sum, item) => sum + item.amount, 0)
    const avgAmount = Math.round(totalAmount / monthlyData.length)
    const growth = Math.round(((monthlyData[monthlyData.length - 1].students - monthlyData[0].students) / monthlyData[0].students) * 100)
    
    return { totalStudents, totalAmount, avgAmount, growth }
  }, [])

  const exportReport = () => {
    const reportData = monthlyData.map(item => ({
      'Ay': item.month,
      'Öğrenci Sayısı': item.students,
      'Toplam Tutar': item.amount,
      'Ortalama Tutar': Math.round(item.amount / item.students)
    }))
    // exportToCsv(`burs-raporu-${selectedPeriod}.csv`, reportData)
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Filtreler */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Burs Raporları</h1>
          <p className="text-gray-600">Detaylı istatistikler ve analitik raporlar</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="monthly">Aylık</option>
            <option value="quarterly">Üç Aylık</option>
            <option value="yearly">Yıllık</option>
          </select>
          
          <button
            onClick={exportReport}
            className="flex items-center gap-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
          >
            <Download size={16} />
            Rapor İndir
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* <StatCard // Removed - file deleted
          title="Toplam Öğrenci"
          value={totalStats.totalStudents.toString()}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Toplam Burs Tutarı"
          value={`₺${totalStats.totalAmount.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6" />}
        />
        <StatCard
          title="Aylık Ortalama"
          value={`₺${totalStats.avgAmount.toLocaleString()}`}
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <StatCard
          title="Aktif Burslar"
          value="95%"
          icon={<GraduationCap className="h-6 w-6" />}
        /> */}
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aylık Öğrenci Sayısı */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Öğrenci Sayısı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Burs Türleri Dağılımı */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Burs Türleri Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scholarshipTypes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {scholarshipTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Aylık Burs Tutarları */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aylık Burs Tutarları</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₺${value.toLocaleString()}`, 'Tutar']} />
              <Bar dataKey="amount" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cinsiyet Dağılımı */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cinsiyet Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Akademik Performans Trendi */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Akademik Performans Trendi</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 4]} />
            <Tooltip formatter={(value) => [value, 'Not Ortalaması']} />
            <Line type="monotone" dataKey="average" stroke="#F59E0B" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detaylı Tablo */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detaylı Aylık Rapor</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Ay</th>
                <th className="text-right py-2">Öğrenci Sayısı</th>
                <th className="text-right py-2">Toplam Tutar</th>
                <th className="text-right py-2">Ortalama Tutar</th>
                <th className="text-right py-2">Büyüme</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((item, index) => {
                const prevMonth = index > 0 ? monthlyData[index - 1] : null
                const growth = prevMonth ? Math.round(((item.students - prevMonth.students) / prevMonth.students) * 100) : 0
                
                return (
                  <tr key={item.month} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{item.month}</td>
                    <td className="text-right py-2">{item.students}</td>
                    <td className="text-right py-2">₺{item.amount.toLocaleString()}</td>
                    <td className="text-right py-2">₺{Math.round(item.amount / item.students).toLocaleString()}</td>
                    <td className={`text-right py-2 ${
                      growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {growth > 0 ? '+' : ''}{growth}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

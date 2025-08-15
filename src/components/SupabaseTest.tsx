import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

interface TestResult {
  success: boolean
  data?: any
  error?: any
  message: string
}

const SupabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result])
  }

  const testConnection = async () => {
    setIsLoading(true)
    setTestResults([])

    // Test 1: Bağlantı testi
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('count')
        .limit(1)

      if (error) {
        addResult({
          success: false,
          error,
          message: 'Beneficiaries tablosuna erişim başarısız'
        })
      } else {
        addResult({
          success: true,
          data,
          message: 'Beneficiaries tablosuna başarıyla bağlandı'
        })
      }
    } catch (err) {
      addResult({
        success: false,
        error: err,
        message: 'Beklenmeyen hata oluştu'
      })
    }

    // Test 2: Auth durumu kontrolü (Mock auth kullanıldığında skip)
    try {
      // Development ortamında mock auth kullanıldığını belirt
      if (process.env.NODE_ENV === 'development') {
        addResult({
          success: true,
          data: { mock: true },
          message: 'Development ortamında mock auth kullanılıyor'
        })
      } else {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          addResult({
            success: false,
            error,
            message: 'Auth durumu kontrol edilemedi'
          })
        } else {
          addResult({
            success: true,
            data: user,
            message: user ? `Kullanıcı giriş yapmış: ${user.email}` : 'Kullanıcı giriş yapmamış'
          })
        }
      }
    } catch (err) {
      addResult({
        success: false,
        error: err,
        message: 'Auth kontrolünde hata'
      })
    }

    // Test 3: Realtime bağlantısı (Development ortamında simüle edilir)
    try {
      if (process.env.NODE_ENV === 'development') {
        // Development ortamında realtime simülasyonu
        addResult({
          success: true,
          data: { status: 'SIMULATED', mock: true },
          message: 'Development ortamında realtime simüle ediliyor'
        })
      } else {
        const channel = supabase.channel('test-channel')
        
        channel.subscribe((status) => {
          addResult({
            success: status === 'SUBSCRIBED',
            data: { status },
            message: `Realtime durumu: ${status}`
          })
        })

        // 3 saniye sonra kanalı kapat
        setTimeout(() => {
          supabase.removeChannel(channel)
        }, 3000)
      }
    } catch (err) {
      addResult({
        success: false,
        error: err,
        message: 'Realtime bağlantısında hata'
      })
    }

    setIsLoading(false)
  }

  const testBeneficiariesTable = async () => {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, name, surname, status, created_at')
        .limit(5)

      if (error) {
        addResult({
          success: false,
          error,
          message: 'Beneficiaries tablosu bulunamadı veya erişim hatası'
        })
      } else {
        addResult({
          success: true,
          data,
          message: `Beneficiaries tablosundan ${data?.length || 0} kayıt getirildi`
        })
      }
    } catch (err) {
      addResult({
        success: false,
        error: err,
        message: 'Beneficiaries tablosu testinde beklenmeyen hata'
      })
    }

    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Supabase Bağlantı Testi
        </h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Test Ediliyor...' : 'Genel Test'}
          </button>
          
          <button
            onClick={testBeneficiariesTable}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Beneficiaries Tablosu Test
          </button>
          
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Temizle
          </button>
        </div>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-lg ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.success ? '✅' : '❌'}
                </span>
                <span className="font-medium">{result.message}</span>
              </div>
              
              {result.data && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Veri:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {result.error && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Hata:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(result.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {testResults.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Test sonuçları burada görünecek
          </div>
        )}
      </div>
    </div>
  )
}

export default SupabaseTest
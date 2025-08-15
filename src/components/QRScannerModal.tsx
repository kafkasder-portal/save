import { useState, useRef, useEffect, useCallback } from 'react'
import { Modal } from './Modal'
import QrScanner from 'qr-scanner'
import { parseQRCode } from '../utils/qrCodeUtils'
import { log } from '@/utils/logger'

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (bankData: Record<string, unknown>) => void
}

interface ScanResult {
  bankNumber: string
  bankId: string
  timestamp: string
}

export const QRScannerModal = ({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [hasCamera, setHasCamera] = useState(true)
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)

  // QR kod tarama başarılı olduğunda
  const handleScanSuccess = useCallback((result: QrScanner.ScanResult) => {
    const parsedData = parseQRCode(result.data)
    
    if (parsedData.isValid) {
      setScanResult({
        bankNumber: parsedData.bankNumber!,
        bankId: parsedData.bankId!,
        timestamp: parsedData.timestamp!
      })
      setError(null)
      
      // Taramayı durdur
      if (qrScannerRef.current) {
        qrScannerRef.current.stop()
        setIsScanning(false)
      }
      
      // Başarılı tarama callback'i
      onScanSuccess(parsedData)
    } else {
      setError('Geçersiz QR kod. Lütfen kumbara QR kodunu tarayın.')
    }
  }, [onScanSuccess])

  // QR kod tarama hatası
  const handleScanError = (error: string | Error) => {
    log.error('QR tarama hatası:', error)
    setError('QR kod taranırken hata oluştu')
  }

  // Kamera başlat
  const startScanning = useCallback(async () => {
    if (!videoRef.current) return

    try {
      setError(null)
      setScanResult(null)
      
      // QR Scanner oluştur
      const qrScanner = new QrScanner(
        videoRef.current,
        handleScanSuccess,
        {
          onDecodeError: handleScanError,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment' // Arka kamera tercih et
        }
      )
      
      qrScannerRef.current = qrScanner
      
      // Taramayı başlat
      await qrScanner.start()
      setIsScanning(true)
      
    } catch (error) {
      log.error('Kamera başlatma hatası:', error)
      setError('Kamera erişimi sağlanamadı. Lütfen kamera izinlerini kontrol edin.')
      setHasCamera(false)
    }
  }, [handleScanSuccess])

  // Taramayı durdur
  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    setIsScanning(false)
  }

  // Kamera değiştir
  const switchCamera = async () => {
    if (qrScannerRef.current) {
      try {
        const cameras = await QrScanner.listCameras()
        if (cameras.length > 1) {
          // Basit kamera değiştirme - ilk kameradan ikinciye geç
          const nextCamera = cameras[currentCameraIndex + 1] || cameras[0]
          await qrScannerRef.current.setCamera(nextCamera.id)
          setCurrentCameraIndex((currentCameraIndex + 1) % cameras.length)
        }
      } catch (error) {
        log.error('Kamera değiştirme hatası:', error)
      }
    }
  }

  // Modal açıldığında taramayı başlat
  useEffect(() => {
    if (isOpen) {
      // Kamera desteği kontrolü
      QrScanner.hasCamera().then(setHasCamera)
      
      // Kısa bir gecikme ile taramayı başlat
      const timer = setTimeout(() => {
        startScanning()
      }, 500)
      
      return () => clearTimeout(timer)
    } else {
      // Modal kapandığında taramayı durdur
      stopScanning()
      setScanResult(null)
      setError(null)
    }
  }, [isOpen, startScanning])

  // Component unmount olduğunda temizlik
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Kod Tarayıcı" size="medium">
      <div className="space-y-4">
        {/* Kamera Desteği Yok */}
        {!hasCamera && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <span>📷</span>
              <span className="font-medium">Kamera Bulunamadı</span>
            </div>
            <p className="text-red-600 text-sm mt-1">
              Bu cihazda kamera bulunamadı veya kamera erişimi engellendi.
            </p>
          </div>
        )}

        {/* Video Alanı */}
        {hasCamera && (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-64 bg-black rounded-lg object-cover"
              playsInline
              muted
            />
            
            {/* Tarama Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-blue-500 w-48 h-48 rounded-lg animate-pulse">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kontrol Butonları */}
        {hasCamera && (
          <div className="flex justify-center gap-2">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <span>📷</span>
                Taramayı Başlat
              </button>
            ) : (
              <>
                <button
                  onClick={stopScanning}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                >
                  <span>⏹️</span>
                  Durdur
                </button>
                <button
                  onClick={switchCamera}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
                >
                  <span>🔄</span>
                  Kamera Değiştir
                </button>
              </>
            )}
          </div>
        )}

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700">
              <span>⚠️</span>
              <span className="font-medium">Hata</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Başarılı Tarama Sonucu */}
        {scanResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <span>✅</span>
              <span className="font-medium">QR Kod Başarıyla Tarandı</span>
            </div>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-600">Kumbara Numarası:</span>
                <span className="ml-2 font-medium">{scanResult.bankNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">Kumbara ID:</span>
                <span className="ml-2 font-medium">{scanResult.bankId}</span>
              </div>
              <div>
                <span className="text-gray-600">Tarih:</span>
                <span className="ml-2 font-medium">
                  {new Date(scanResult.timestamp).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Kullanım Talimatları */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          💡 <strong>Nasıl Kullanılır:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>QR kodu kamera görüş alanına getirin</li>
            <li>QR kod otomatik olarak taranacaktır</li>
            <li>Kumbara bilgileri görüntülenecektir</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}
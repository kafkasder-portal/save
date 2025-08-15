import React, { Suspense, lazy } from 'react'
import { Modal } from './Modal'
import { LoadingSpinner } from './ui/LoadingSpinner'

// Lazy load the QRScannerModal to reduce initial bundle size
const QRScannerModal = lazy(() => import('./QRScannerModal').then(module => ({ default: module.QRScannerModal })))

interface LazyQRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onScanSuccess: (data: any) => void
}

const LazyQRScannerModal: React.FC<LazyQRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  if (!isOpen) return null

  return (
    <Suspense fallback={
      <Modal isOpen={isOpen} onClose={onClose} title="QR Kod Tarayıcı">
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner />
          <span className="ml-2">QR Tarayıcı yükleniyor...</span>
        </div>
      </Modal>
    }>
      <QRScannerModal 
        isOpen={isOpen} 
        onClose={onClose} 
        onScanSuccess={onScanSuccess} 
      />
    </Suspense>
  )
}

export default LazyQRScannerModal

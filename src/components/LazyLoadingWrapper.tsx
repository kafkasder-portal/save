import { Suspense, ReactNode } from 'react'
import { LoadingSpinner } from './ui/LoadingSpinner'

interface LazyLoadingWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function LazyLoadingWrapper({ children, fallback }: LazyLoadingWrapperProps) {
  const defaultFallback = (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500 dark:text-gray-400">Sayfa yükleniyor...</p>
      </div>
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}

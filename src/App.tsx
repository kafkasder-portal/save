import { DashboardLayout } from './layouts/DashboardLayout'
import AppRoutes from './routes'
import { Toaster } from 'sonner'
import { useState, useEffect, startTransition, Suspense } from 'react'
import CommandPalette from './components/CommandPalette'
// import AICommandCenter from './components/AICommandCenter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ErrorBoundary } from 'react-error-boundary'
import { log } from '@/utils/logger'
import { LoadingSpinner } from './components/ui/LoadingSpinner'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-foreground">Bir şeyler yanlış gitti</h2>
        <p className="text-muted-foreground">
          Uygulama beklenmeyen bir hata ile karşılaştı. Lütfen sayfayı yenileyin.
        </p>
        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Tekrar Dene
          </button>
          <button
            onClick={() => window.location.reload()}
            className="block w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground">Hata Detayları</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

// Loading Component
function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground">Uygulama yükleniyor...</p>
      </div>
    </div>
  )
}

// Inner component that uses theme-dependent hooks
function AppContent() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isCmdOpen, setIsCmdOpen] = useState(false)

  useEffect(() => {
    const open = () => {
      startTransition(() => {
        setIsCmdOpen(true)
      })
    }
    window.addEventListener('open-command-palette', open as any)
    return () => window.removeEventListener('open-command-palette', open as any)
  }, [])

  const toggleChat = () => {
    startTransition(() => {
      setIsChatOpen(!isChatOpen)
    })
  }

  return (
    <DashboardLayout onOpenAICenter={() => {}}>
      <Suspense fallback={<AppLoading />}>
        <AppRoutes />
      </Suspense>
      <Toaster
        position="top-right"
        expand={true}
        richColors
        closeButton
      />
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        toggleChat={toggleChat}
        onOpenAICenter={() => {}}
      />
      {/* <AICommandCenter
        isOpen={false}
        onClose={() => {}}
        context={{}}
        userId=""
      /> */}
    </DashboardLayout>
  )
}

export default function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        log.error('App Error:', { error, errorInfo })
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

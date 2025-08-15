import { type ReactNode, useEffect, useRef, useCallback } from 'react'

type ModalProps = {
  open?: boolean
  isOpen?: boolean
  title?: string | ReactNode
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  ariaDescribedBy?: string
  size?: 'small' | 'medium' | 'large' | 'xl'
}

export function Modal({ 
  open, 
  isOpen, 
  title, 
  onClose, 
  children,
  ariaLabel,
  ariaDescribedBy,
  size = 'medium'
}: ModalProps) {
  const visible = Boolean(isOpen ?? open)
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)

  // Focus trap implementation
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!modalRef.current) return
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }
  }, [])

  useEffect(() => {
    if (visible) {
      // Store the current focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Set focus to modal after a brief delay to ensure DOM is updated
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        firstFocusable?.focus()
      }, 10)

      return () => {
        document.body.style.overflow = 'unset'
        // Restore focus to the previously focused element
        previousActiveElementRef.current?.focus()
      }
    }
  }, [visible])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (visible) {
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', trapFocus)
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', trapFocus)
      }
    }
  }, [visible, onClose, trapFocus])

  if (!visible) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || (typeof title === 'string' ? title : 'Modal')}
      aria-describedby={ariaDescribedBy}
    >
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        ref={modalRef}
        className={`relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-lg border bg-background p-0 shadow-xl mx-4 ${
          size === 'small' ? 'max-w-md' :
          size === 'medium' ? 'max-w-2xl' :
          size === 'large' ? 'max-w-4xl' :
          size === 'xl' ? 'max-w-6xl' : 'max-w-2xl'
        }`}
        role="document"
      >
        {title && (
          <div className="border-b px-4 py-3 text-base font-semibold flex items-center justify-between">
            <h2 id="modal-title">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Kapat"
              type="button"
            >
              ×
            </button>
          </div>
        )}
        <div id={ariaDescribedBy || "modal-content"} className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
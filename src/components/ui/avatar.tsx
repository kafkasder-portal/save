import { memo } from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Avatar = memo(function Avatar({
  src,
  alt,
  fallback,
  className = '',
  size = 'md'
}: AvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg'
  }

  const baseClasses = `
    relative inline-flex items-center justify-center 
    rounded-full bg-gray-100 dark:bg-gray-700 
    font-medium text-gray-600 dark:text-gray-300
    overflow-hidden shrink-0
    ${sizeClasses[size]}
    ${className}
  `.trim()

  if (src) {
    return (
      <div className={baseClasses}>
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Hide image on error and show fallback
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent && fallback) {
              parent.textContent = fallback
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className={baseClasses}>
      {fallback || '?'}
    </div>
  )
})

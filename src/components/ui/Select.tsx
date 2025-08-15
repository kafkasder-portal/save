import { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'form-input appearance-none pr-10 cursor-pointer',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = 'Select'

interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const SelectOption = forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => (
    <option
      ref={ref}
      className={cn('bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100', className)}
      {...props}
    />
  )
)
SelectOption.displayName = 'SelectOption'

export { Select, SelectOption }

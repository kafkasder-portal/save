import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TypeScriptPatternsExample from '../TypeScriptPatternsExample'

// Import jest-dom matchers
import '@testing-library/jest-dom'

// Mock console.log to test logging
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('TypeScriptPatternsExample', () => {
  beforeEach(() => {
    consoleSpy.mockClear()
  })

  describe('4a) Event Types', () => {
    it('should handle input change events with proper typing', async () => {
      const user = userEvent.setup()
      render(<TypeScriptPatternsExample />)
      
      const _input = screen.getByPlaceholderText('Enter amount')
       await user.type(_input, '123')
      
      expect(consoleSpy).toHaveBeenCalledWith('123')
    })

    it('should handle multiple input changes', async () => {
      const user = userEvent.setup()
      render(<TypeScriptPatternsExample />)
      
      const input = screen.getByPlaceholderText('Enter amount')
      await user.type(input, '456')
      await user.clear(input)
      await user.type(input, '789')
      
      expect(consoleSpy).toHaveBeenCalledWith('456')
      expect(consoleSpy).toHaveBeenCalledWith('789')
    })
  })

  describe('4b) useRef', () => {
    it('should have input ref properly typed', () => {
      render(<TypeScriptPatternsExample />)
      
      const input = screen.getByPlaceholderText('Enter amount')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('type', 'number')
    })

    it('should access input value through ref on save', async () => {
      const user = userEvent.setup()
      const mockOnSave = vi.fn()
      render(<TypeScriptPatternsExample onSave={mockOnSave} />)
      
      const input = screen.getByPlaceholderText('Enter amount')
      await user.type(input, '42')
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      expect(mockOnSave).toHaveBeenCalled()
    })
  })

  describe('4c) useState + Union Types', () => {
    it('should handle null amount state', async () => {
      const user = userEvent.setup()
      render(<TypeScriptPatternsExample />)
      
      // Initially amount is null, so component should render
      expect(screen.getByText('TypeScript Patterns Example')).toBeInTheDocument()
      
      const input = screen.getByPlaceholderText('Enter amount')
      await user.type(input, '100')
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      // After save, amount should be displayed
      expect(screen.getByText('Current amount: 100')).toBeInTheDocument()
    })

    it('should handle invalid number input', async () => {
      const user = userEvent.setup()
      render(<TypeScriptPatternsExample />)
      
      const input = screen.getByPlaceholderText('Enter amount')
      await user.type(input, 'invalid')
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      // Should handle NaN gracefully - the component shows "Current amount:" when null
      expect(screen.getByText('Current amount:')).toBeInTheDocument()
    })
  })

  describe('4d) Props', () => {
    it('should render with children prop', () => {
      const testChildren = <div data-testid="test-children">Test Content</div>
      render(<TypeScriptPatternsExample>{testChildren}</TypeScriptPatternsExample>)
      
      expect(screen.getByTestId('test-children')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render without children prop', () => {
      render(<TypeScriptPatternsExample />)
      
      expect(screen.getByText('TypeScript Patterns Example')).toBeInTheDocument()
      expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
    })

    it('should call onSave prop when save button is clicked', async () => {
      const user = userEvent.setup()
      const mockOnSave = vi.fn()
      render(<TypeScriptPatternsExample onSave={mockOnSave} />)
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })

    it('should work without onSave prop', async () => {
      const user = userEvent.setup()
      render(<TypeScriptPatternsExample />)
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      // Should not throw error when onSave is undefined
      expect(screen.getByText('TypeScript Patterns Example')).toBeInTheDocument()
    })
  })

  describe('5a) Safe Indexing (Dict<T>)', () => {
    it('should display safe indexed values', () => {
      render(<TypeScriptPatternsExample />)
      
      expect(screen.getByText('Apple count: 5')).toBeInTheDocument()
      expect(screen.getByText('Banana count: 3')).toBeInTheDocument()
      expect(screen.getByText('Orange count: 7')).toBeInTheDocument()
    })

    it('should handle unknown keys gracefully', () => {
      render(<TypeScriptPatternsExample />)
      
      expect(screen.getByText('Unknown fruit: Not found')).toBeInTheDocument()
    })
  })

  describe('5b) Unknown Type Narrowing', () => {
    it('should handle unknown data types correctly', async () => {
      const user = userEvent.setup()
      render(<TypeScriptPatternsExample />)
      
      const testButton = screen.getByRole('button', { name: /test unknown types/i })
      await user.click(testButton)
      
      // Check that console.log was called for each type
      expect(consoleSpy).toHaveBeenCalledWith('String value:', 'HELLO WORLD')
      expect(consoleSpy).toHaveBeenCalledWith('Number value:', '42.50')
      expect(consoleSpy).toHaveBeenCalledWith('Array length:', 3)
    })
  })

  describe('5c) API Response Type', () => {
    it('should display API response data correctly', () => {
      render(<TypeScriptPatternsExample />)
      
      expect(screen.getByText('ID: 1')).toBeInTheDocument()
      expect(screen.getByText('Name: Test Item')).toBeInTheDocument()
    })

    it('should handle API response without error', () => {
      render(<TypeScriptPatternsExample />)
      
      // Should not display error message when error is undefined
      expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()
    })
  })

  describe('Integration Tests', () => {
    it('should work with all patterns together', async () => {
      const user = userEvent.setup()
      const mockOnSave = vi.fn()
      const testChildren = <div data-testid="integration-test">Integration Test</div>
      
      render(
        <TypeScriptPatternsExample onSave={mockOnSave}>
          {testChildren}
        </TypeScriptPatternsExample>
      )
      
      // Test children rendering
      expect(screen.getByTestId('integration-test')).toBeInTheDocument()
      
      // Test input interaction
      const amountInput = screen.getByPlaceholderText('Enter amount')
      await user.type(amountInput, '999')
      
      // Test save functionality
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      // Test unknown types
      const testButton = screen.getByRole('button', { name: /test unknown types/i })
      await user.click(testButton)
      
      // Verify all functionality works together
      expect(mockOnSave).toHaveBeenCalled()
      expect(screen.getByText('Current amount: 999')).toBeInTheDocument()
      expect(consoleSpy).toHaveBeenCalledWith('999')
    })

    it('should handle edge cases gracefully', async () => {
      const user = userEvent.setup()
      render(<TypeScriptPatternsExample />)
      
      // Test empty input
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)
      
      // Should handle empty input without crashing
      expect(screen.getByText('TypeScript Patterns Example')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(<TypeScriptPatternsExample />)
      
      const input = screen.getByPlaceholderText('Enter amount')
      expect(input).toBeInTheDocument()
      
      const saveButton = screen.getByRole('button', { name: /save/i })
      expect(saveButton).toBeInTheDocument()
      
      const testButton = screen.getByRole('button', { name: /test unknown types/i })
      expect(testButton).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<TypeScriptPatternsExample />)
      
      const input = screen.getByPlaceholderText('Enter amount')
      await user.tab()
      expect(input).toHaveFocus()
      
      await user.tab()
      const saveButton = screen.getByRole('button', { name: /save/i })
      expect(saveButton).toHaveFocus()
    })
  })
})

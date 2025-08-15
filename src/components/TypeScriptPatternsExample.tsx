import React, { useState } from 'react'
import { log } from '@/utils/logger'

// 5c) API tipi
type ApiResp<T> = { data: T; error?: string }

// 5a) Güvenli indeksleme
type Dict<T> = Record<string, T>

// 4d) Props type definition
type Props = { 
  children?: React.ReactNode; 
  onSave?: () => void 
}

export default function TypeScriptPatternsExample({ children, onSave }: Props) {
  // 4c) useState + union type
  const [amount, setAmount] = useState<number | null>(null)
  
  // 4b) useRef
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  
  // 5a) Güvenli indeksleme örneği
  const map: Dict<number> = {
    'apple': 5,
    'banana': 3,
    'orange': 7
  }
  
  // 5b) unknown -> daraltma örneği
  const handleUnknownData = (x: unknown) => {
    if (typeof x === 'string') {
      log.debug('String value:', x.toUpperCase()) // x: string
    } else if (typeof x === 'number') {
      log.debug('Number value:', x.toFixed(2)) // x: number
    } else if (Array.isArray(x)) {
      log.debug('Array length:', x.length) // x: any[]
    }
  }
  
  // 5c) API response örneği
  const mockApiResponse: ApiResp<{ id: number; name: string }> = {
    data: { id: 1, name: 'Test Item' },
    error: undefined
  }
  
  // 4a) Event type
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    log.debug('Input value changed:', e.currentTarget.value)
  }
  
  const handleSave = () => {
    if (inputRef.current) {
      const value = inputRef.current.value
      setAmount(parseFloat(value) || null)
    }
    onSave?.()
  }
  
  // Test unknown type narrowing
  const testUnknownData = () => {
    handleUnknownData('hello world')
    handleUnknownData(42.5)
    handleUnknownData([1, 2, 3])
  }
  
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">TypeScript Patterns Example</h3>
      
      {/* Children prop usage */}
      {children}
      
      {/* Input with ref and event handler */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Amount (using useRef + event type)
        </label>
        <input
          ref={inputRef}
          type="number"
          onChange={onChange}
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Enter amount"
        />
      </div>
      
      {/* Display amount (union type) */}
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Current amount: {amount}
        </p>
      </div>
      
      {/* 5a) Safe indexing example */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <h4 className="font-medium text-sm mb-2">5a) Safe Indexing (Dict&lt;T&gt;)</h4>
        <div className="text-xs space-y-1">
          <p>Apple count: {map['apple']}</p>
          <p>Banana count: {map['banana']}</p>
          <p>Orange count: {map['orange']}</p>
          <p>Unknown fruit: {map['unknown'] || 'Not found'}</p>
        </div>
      </div>
      
      {/* 5c) API Response example */}
      <div className="mt-4 p-3 bg-green-50 rounded">
        <h4 className="font-medium text-sm mb-2">5c) API Response Type</h4>
        <div className="text-xs">
          <p>ID: {mockApiResponse.data.id}</p>
          <p>Name: {mockApiResponse.data.name}</p>
          {mockApiResponse.error && (
            <p className="text-red-600">Error: {mockApiResponse.error}</p>
          )}
        </div>
      </div>
      
      {/* Test buttons */}
      <div className="mt-4 space-x-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Save
        </button>
        <button
          onClick={testUnknownData}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
        >
          Test Unknown Types
        </button>
      </div>
    </div>
  )
}

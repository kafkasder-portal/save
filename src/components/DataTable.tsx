import { useMemo, memo } from 'react'

export type Column<T> = {
  key: keyof T | string
  header: string
  render?: (value: any, row: T, index?: number) => React.ReactNode
  className?: string
}

type Props<T> = {
  columns: Column<T>[]
  data: T[]
  keyExtractor?: (item: T, index: number) => string | number
  loading?: boolean
  emptyMessage?: string
}

const DataTableComponent = <T,>({ 
  columns, 
  data, 
  keyExtractor,
  loading = false,
  emptyMessage = "Kayıt bulunamadı."
}: Props<T>) => {
  
  // Memoized column headers
  const memoizedHeaders = useMemo(() => {
    return columns.map((c) => (
      <th 
        key={String(c.key)} 
        className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground"
      >
        {c.header}
      </th>
    ))
  }, [columns])

  // Memoized table rows
  const memoizedRows = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td className="px-3 py-4 text-center text-muted-foreground" colSpan={columns.length}>
            Yükleniyor...
          </td>
        </tr>
      )
    }

    if (data.length === 0) {
      return (
        <tr>
          <td className="px-3 py-4 text-center text-muted-foreground" colSpan={columns.length}>
            {emptyMessage}
          </td>
        </tr>
      )
    }

    return data.map((row, idx) => {
      const key = keyExtractor ? keyExtractor(row, idx) : idx
      
      return (
        <tr key={key} className="border-t hover:bg-gray-50 transition-colors">
          {columns.map((c) => {
            const value = (row as Record<string, any>)[String(c.key)]
            return (
              <td key={String(c.key)} className={`px-3 py-2 ${c.className ?? ''}`}>
                {c.render ? c.render(value, row, idx) : (value != null ? String(value) : '')}
              </td>
            )
          })}
        </tr>
      )
    })
  }, [data, columns, keyExtractor, loading, emptyMessage])

  return (
    <div className="overflow-auto rounded-lg border shadow-sm">
      <table 
        className="w-full text-sm" 
        role="table"
        aria-label="Veri tablosu"
      >
        <thead className="bg-muted/50">
          <tr role="row">
            {memoizedHeaders}
          </tr>
        </thead>
        <tbody>
          {memoizedRows}
        </tbody>
      </table>
    </div>
  )
}

const DataTable = memo(DataTableComponent) as <T>(props: Props<T>) => React.JSX.Element

// Add displayName for better debugging
;(DataTable as any).displayName = 'DataTable'

export { DataTable }

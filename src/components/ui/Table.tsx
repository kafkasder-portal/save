import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="table-container">
      <table
        ref={ref}
        className={cn('table', className)}
        {...props}
      />
    </div>
  )
)
Table.displayName = 'Table'

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={cn('table-header', className)}
      {...props}
    />
  )
)
TableHeader.displayName = 'TableHeader'

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn('bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700', className)}
      {...props}
    />
  )
)
TableBody.displayName = 'TableBody'

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn('table-row', className)}
      {...props}
    />
  )
)
TableRow.displayName = 'TableRow'

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn('table-header-cell', className)}
      {...props}
    />
  )
)
TableHead.displayName = 'TableHead'

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('table-cell', className)}
      {...props}
    />
  )
)
TableCell.displayName = 'TableCell'

export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
}

import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

/** Tabla densa del DS: bordes nítidos de 1 px, encabezados overline y decoración mínima. */
export function Table({ className, children, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-left text-label', className)} {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-linea bg-papel">
      <tr>{children}</tr>
    </thead>
  )
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn('whitespace-nowrap px-4 py-3 text-overline uppercase text-asfalto-3', className)}
      {...props}
    />
  )
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-linea">{children}</tbody>
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('transition-colors hover:bg-papel/60', className)} {...props} />
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-4 py-3 align-middle text-asfalto', className)} {...props} />
}

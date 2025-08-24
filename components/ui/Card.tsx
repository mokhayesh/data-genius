import clsx from 'clsx'
import * as React from 'react'

export default function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('rounded-2xl bg-surface-card shadow-soft border border-surface-ring', className)} {...props} />
  )
}
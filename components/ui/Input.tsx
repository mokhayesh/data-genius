import * as React from 'react'
import clsx from 'clsx'

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'h-11 w-full rounded-xl border border-surface-ring bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400',
        'focus:outline-none focus:ring-2 focus:ring-brand-400',
        className,
      )}
      {...props}
    />
  )
}
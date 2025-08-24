'use client'
import * as React from 'react'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  className,
  children,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 disabled:pointer-events-none'
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }[size]
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft',
    secondary: 'bg-surface-card text-slate-900 hover:bg-slate-50 border border-surface-ring',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  }[variant]

  return (
    <button className={clsx(base, sizes, variants, className)} {...props}>
      {children}
    </button>
  )
}
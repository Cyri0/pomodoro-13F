import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: ReactNode
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent)] text-stone-950 hover:brightness-110 shadow-[0_8px_24px_color-mix(in_srgb,var(--accent)_28%,transparent)]',
  secondary:
    'bg-white/6 text-zinc-100 hover:bg-white/10 border border-white/10',
  ghost: 'bg-transparent text-zinc-300 hover:bg-white/6 hover:text-white',
}

export function Button({
  variant = 'secondary',
  icon,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium tracking-wide transition duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}

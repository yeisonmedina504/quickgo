import { cn } from '@/lib/cn'

interface LogoProps {
  tone?: 'dark' | 'light'
  className?: string
}

export function Logo({ tone = 'dark', className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span aria-hidden className="flex size-8 items-center justify-center rounded-control bg-ambar">
        <svg viewBox="0 0 24 24" className="size-5 text-asfalto" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 7h9v9H4zM13 10h4l3 3v3h-7" strokeLinejoin="round" />
          <circle cx="7.5" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="16.5" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span
        className={cn('font-display text-h3 font-extrabold tracking-tight', tone === 'dark' ? 'text-asfalto' : 'text-blanco')}
      >
        QuickGo
      </span>
    </span>
  )
}

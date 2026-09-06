import { forwardRef } from 'react'
import {
  Turnstile,
  type TurnstileInstance,
  type TurnstileProps,
} from '@marsidev/react-turnstile'

import { cn } from '#/lib/utils'

export function getTurnstileSiteKey() {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
  if (typeof siteKey !== 'string' || !siteKey.trim()) {
    throw new Error('VITE_TURNSTILE_SITE_KEY is not set')
  }
  return siteKey.trim()
}

type TurnstileFieldProps = {
  onTokenChange: (token: string | null) => void
  className?: string
  options?: TurnstileProps['options']
}

export const TurnstileField = forwardRef<
  TurnstileInstance | undefined,
  TurnstileFieldProps
>(function TurnstileField({ onTokenChange, className, options }, ref) {
  return (
    <div className={cn('flex justify-center', className)}>
      <Turnstile
        ref={ref}
        siteKey={getTurnstileSiteKey()}
        options={{
          theme: 'dark',
          size: 'flexible',
          ...options,
        }}
        onSuccess={(token) => onTokenChange(token)}
        onExpire={() => onTokenChange(null)}
        onError={() => onTokenChange(null)}
        onTimeout={() => onTokenChange(null)}
      />
    </div>
  )
})

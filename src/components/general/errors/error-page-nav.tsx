import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeftIcon, HouseIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { getFirstModuleHomePath } from '#/lib/utils'
import type { Module } from '#/lib/types'

const buttonClassName = 'h-11 gap-2 rounded-xl px-5'

export function useErrorPageHomePath(modules?: Module[]) {
  return getFirstModuleHomePath(modules)
}

export function ErrorPageHomeButton({ homePath }: { homePath: string }) {
  return (
    <Button
      render={<Link to={homePath} />}
      nativeButton={false}
      size="lg"
      className={buttonClassName}
    >
      <HouseIcon className="size-4" aria-hidden />
      Back to home
    </Button>
  )
}

export function ErrorPageGoBackButton() {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={() => router.history.back()}
      className={buttonClassName}
    >
      <ArrowLeftIcon className="size-4" aria-hidden />
      Go back
    </Button>
  )
}

export function ErrorPageNavButtons({ homePath }: { homePath: string }) {
  return (
    <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <ErrorPageHomeButton homePath={homePath} />
      <ErrorPageGoBackButton />
    </div>
  )
}

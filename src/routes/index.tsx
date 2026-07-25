import { createFileRoute } from '@tanstack/react-router'

import HeroSection from '#/components/site/hero-section'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="">
      <HeroSection />
    </main>
  )
}

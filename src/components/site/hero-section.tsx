import { ChevronRight } from 'lucide-react'

import { HeroHeader } from './hero-header'
import { Button } from '@/components/ui/button'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

export default function HeroSection() {
  return (
    <>
      <HeroHeader />

      <main className="overflow-x-hidden">
        <section>
          <div className="relative">
            <div className="relative z-10 flex aspect-2/3 flex-col justify-end px-6 lg:aspect-video">
              <div className="mx-auto w-full max-w-7xl pb-6 lg:px-12 lg:pb-32">
                <div className="max-w-lg">
                  <h1 className="text-balance text-5xl md:text-6xl xl:text-7xl">
                    Africa&apos;s No. 1 Tech Platform
                  </h1>
                  <p className="mt-6 text-balance text-lg">
                    Let&apos;s Improve African Lives Using Numbers
                  </p>

                  <div className="mt-8 flex items-center gap-2">
                    <Button
                      render={<a href="#link" />}
                      nativeButton={false}
                      size="lg"
                      className="h-12 rounded-full pl-5 pr-3 text-base"
                    >
                      <span className="text-nowrap">Start Building</span>
                      <ChevronRight className="ml-1" />
                    </Button>
                    <Button
                      render={<a href="#link" />}
                      nativeButton={false}
                      size="lg"
                      variant="ghost"
                      className="h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 dark:hover:bg-white/5"
                    >
                      <span className="text-nowrap">Request a demo</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-1 aspect-2/3 overflow-hidden rounded-3xl border border-black/10 lg:aspect-video lg:rounded-[3rem] dark:border-white/5">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="size-full -scale-x-100 object-cover not-dark:invert"
                src="/hero.mp4"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/75 to-background/20" />
              <div className="absolute inset-0 bg-linear-to-r from-background/90 via-background/30 to-transparent lg:from-background/70" />
            </div>
          </div>
        </section>

        <section className="bg-background py-6">
          <div className="group relative m-auto max-w-7xl px-6">
            <div className="flex flex-col items-center md:flex-row">
              <div className="md:max-w-44 md:border-r md:pr-6">
                <p className="text-end text-sm">Powering the best teams</p>
              </div>
              <div className="**:fill-foreground relative py-6 md:w-[calc(100%-11rem)]">
                <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
                  <img
                    src="/tisini.png"
                    alt="Team A"
                    className="h-6 w-auto object-contain dark:invert"
                  />
                  <img
                    src="/tisini.png"
                    alt="Team B"
                    className="h-6 w-auto object-contain"
                  />
                  <img
                    src="/tisini.png"
                    alt="KPL"
                    className="h-5 w-auto object-contain dark:invert"
                  />
                  {/* add more — aim for 6–10 logos */}
                </InfiniteSlider>

                <div className="from-background absolute inset-y-0 left-0 w-20 bg-linear-to-r" />
                <div className="from-background absolute inset-y-0 right-0 w-20 bg-linear-to-l" />
                <ProgressiveBlur
                  className="pointer-events-none absolute left-0 top-0 h-full w-20"
                  direction="left"
                  blurIntensity={1}
                />
                <ProgressiveBlur
                  className="pointer-events-none absolute right-0 top-0 h-full w-20"
                  direction="right"
                  blurIntensity={1}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

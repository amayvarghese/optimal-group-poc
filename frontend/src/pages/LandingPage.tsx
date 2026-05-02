import { Navbar } from '../components/ui/Navbar'
import { LogoCloudDemo } from '../components/ui/logo-cloud-demo'
import TestimonialV2 from '../components/ui/testimonial-v2'
import { CinematicFooter } from '../components/ui/motion-footer'
import { PageLoadPixelReveal } from '../components/ui/page-load-pixel-reveal'
import { SiteFooter } from '../components/ui/footer'

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />

      <main className="flex w-full flex-col gap-16 pb-10">
        <section
          aria-labelledby="service-highlights"
          className="relative left-1/2 flex min-h-[calc(100svh-72px)] w-screen -translate-x-1/2 items-center justify-center bg-black"
        >
          <h2 id="service-highlights" className="sr-only">
            Service highlights
          </h2>
          <CinematicFooter />
          <PageLoadPixelReveal />
        </section>

        <section
          aria-labelledby="clients"
          className="mx-auto flex min-h-[calc(100svh-72px)] w-full max-w-6xl flex-col justify-center space-y-10 px-4 sm:px-6"
        >
          <div className="-mt-24 flex justify-center">
            <h2
              id="clients"
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-gray-300"
            >
              Our Clients
            </h2>
          </div>
          <LogoCloudDemo />
        </section>

        <section
          aria-labelledby="testimonials"
          className="mx-auto flex min-h-[calc(100svh-72px)] w-full max-w-6xl flex-col justify-center space-y-4 px-4 sm:px-6"
        >
          <h2 id="testimonials" className="sr-only">
            Testimonials
          </h2>
          <TestimonialV2 />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}

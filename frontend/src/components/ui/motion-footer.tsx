'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '../../lib/utils'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STYLES = `
.cinematic-footer-wrapper {
  --pill-bg-1: rgba(255, 255, 255, 0.06);
  --pill-bg-2: rgba(255, 255, 255, 0.03);
  --pill-border: rgba(249, 190, 1, 0.35);
  --pill-bg-1-hover: rgba(249, 190, 1, 0.22);
  --pill-bg-2-hover: rgba(249, 190, 1, 0.14);
  --pill-border-hover: rgba(249, 190, 1, 0.8);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.55; }
  100% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.animate-footer-breathe { animation: footer-breathe 8s ease-in-out infinite alternate; }
.animate-footer-scroll-marquee { animation: footer-scroll-marquee 40s linear infinite; }

.footer-bg-grid {
  background-size: 60px 60px;
  background-image: linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

.footer-aurora {
  background: radial-gradient(circle at 50% 50%, rgba(249,190,1,0.18) 0%, rgba(249,190,1,0.08) 40%, transparent 70%);
}

.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  transition: all .35s cubic-bezier(0.16,1,0.3,1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
}

.footer-giant-bg-text {
  font-size: 22vw;
  line-height: .75;
  font-weight: 900;
  letter-spacing: -.05em;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.12);
}
`

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType
  }

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = 'button', ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null)

    useEffect(() => {
      const element = localRef.current
      if (!element) return

      const ctx = gsap.context(() => {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = element.getBoundingClientRect()
          const h = rect.width / 2
          const w = rect.height / 2
          const x = e.clientX - rect.left - h
          const y = e.clientY - rect.top - w

          gsap.to(element, {
            x: x * 0.28,
            y: y * 0.28,
            scale: 1.04,
            ease: 'power2.out',
            duration: 0.35,
          })
        }

        const handleMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            scale: 1,
            ease: 'elastic.out(1, 0.3)',
            duration: 1,
          })
        }

        element.addEventListener('mousemove', handleMouseMove as EventListener)
        element.addEventListener('mouseleave', handleMouseLeave)

        return () => {
          element.removeEventListener('mousemove', handleMouseMove as EventListener)
          element.removeEventListener('mouseleave', handleMouseLeave)
        }
      }, element)

      return () => ctx.revert()
    }, [])

    return (
      <Component
        ref={(node: HTMLElement) => {
          ;(localRef as React.MutableRefObject<HTMLElement | null>).current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node
        }}
        className={cn('cursor-pointer', className)}
        {...props}
      >
        {children}
      </Component>
    )
  },
)
MagneticButton.displayName = 'MagneticButton'

const MarqueeItem = () => (
  <div className="flex items-center space-x-12 px-6">
    <span>Property Maintenance</span> <span className="text-brand-yellow/70">✦</span>
    <span>Fit-Out Works</span> <span className="text-brand-yellow/70">✦</span>
    <span>Furnishing</span> <span className="text-brand-yellow/70">✦</span>
    <span>Construction Support</span> <span className="text-brand-yellow/70">✦</span>
    <span>Reliable Delivery</span>
  </div>
)

export function CinematicFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const giantTextRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!wrapperRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        giantTextRef.current,
        { y: '8vh', scale: 0.85, opacity: 0 },
        {
          y: '0vh',
          scale: 1,
          opacity: 1,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 85%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )

      gsap.fromTo(
        [headingRef.current, linksRef.current],
        { y: 45, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: 'top 60%',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      )
    }, wrapperRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div ref={wrapperRef} className="relative h-full min-h-[calc(100svh-72px)] w-full overflow-hidden">
        <div className="cinematic-footer-wrapper relative flex h-full min-h-[calc(100svh-72px)] w-full flex-col justify-between overflow-hidden bg-black text-white">
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 animate-footer-breathe rounded-[50%] blur-[80px]" />
          <div className="footer-bg-grid pointer-events-none absolute inset-0 z-0" />

          <div
            ref={giantTextRef}
            className="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          >
            OPTIMAL
          </div>

          <div className="absolute left-0 top-12 z-10 w-full scale-110 -rotate-2 overflow-hidden border-y border-white/10 bg-black/60 py-4 backdrop-blur-md">
            <div className="animate-footer-scroll-marquee flex w-max text-xs font-bold uppercase tracking-[0.3em] text-gray-300 md:text-sm">
              <MarqueeItem />
              <MarqueeItem />
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2
              ref={headingRef}
              className="mb-12 text-center text-5xl font-black tracking-tighter text-white md:text-8xl"
            >
              Ready to start?
            </h2>

            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              <div className="flex w-full flex-wrap justify-center gap-4">
                <MagneticButton
                  as="a"
                  href="/login"
                  className="footer-glass-pill rounded-full px-10 py-5 text-sm font-bold text-brand-yellow md:text-base"
                >
                  Go to Login
                </MagneticButton>

                <MagneticButton
                  as="a"
                  href="/signup"
                  className="footer-glass-pill rounded-full px-10 py-5 text-sm font-bold text-white md:text-base"
                >
                  Create Account
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

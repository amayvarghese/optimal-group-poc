import React from 'react'
import { motion } from 'framer-motion'

interface Testimonial {
  text: string
  image: string
  name: string
  role: string
}

const testimonials: Testimonial[] = [
  {
    text: 'Optimal Maintenance transformed our response times and made site operations far easier to track.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Briana Patton',
    role: 'Senior Realtor',
  },
  {
    text: 'The onboarding was smooth and our engineers adopted the platform in days, not months.',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Bilal Ahmed',
    role: 'Established Broker',
  },
  {
    text: 'Support has been exceptional from day one, with clear guidance and practical solutions.',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Saman Malik',
    role: 'Property Portfolio Manager',
  },
  {
    text: 'The platform helps us align maintenance, fit-out work, and client communication in one place.',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Omar Raza',
    role: 'Real Estate Investor',
  },
  {
    text: 'Robust workflows and quick support have improved project delivery quality across the board.',
    image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Zainab Hussain',
    role: 'Leasing Director',
  },
  {
    text: 'Implementation exceeded expectations and gave us consistent visibility over all active tasks.',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Aliza Khan',
    role: 'Facilities Estimator',
  },
  {
    text: 'Our teams now collaborate faster with a cleaner workflow and less back-and-forth.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Farhan Siddiqui',
    role: 'Commercial Property Advisor',
  },
  {
    text: 'They understood our operations deeply and delivered a practical system our teams trust.',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Sana Sheikh',
    role: 'Residential Lettings Manager',
  },
  {
    text: 'Since rollout, our execution quality and reporting confidence have both improved significantly.',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150',
    name: 'Hassan Ali',
    role: 'Asset Management Consultant',
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

const TestimonialsColumn = (props: {
  className?: string
  testimonials: Testimonial[]
  duration?: number
}) => {
  return (
    <div className={props.className}>
      <motion.ul
        animate={{
          translateY: '-50%',
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'linear',
          repeatType: 'loop',
        }}
        className="m-0 flex list-none flex-col gap-6 bg-transparent p-0 pb-6 transition-colors duration-300"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <motion.li
                  key={`${index}-${i}`}
                  aria-hidden={index === 1 ? 'true' : 'false'}
                  tabIndex={index === 1 ? -1 : 0}
                  whileHover={{
                    scale: 1.03,
                    y: -8,
                    boxShadow:
                      '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 10px 10px -5px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(249, 190, 1, 0.25)',
                    transition: { type: 'spring', stiffness: 400, damping: 17 },
                  }}
                  whileFocus={{
                    scale: 1.03,
                    y: -8,
                    boxShadow:
                      '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 10px 10px -5px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(249, 190, 1, 0.25)',
                    transition: { type: 'spring', stiffness: 400, damping: 17 },
                  }}
                  className="group w-full max-w-xs cursor-default select-none rounded-3xl border border-white/10 bg-[#121212] p-8 shadow-lg shadow-black/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-yellow/40"
                >
                  <blockquote className="m-0 p-0">
                    <p className="m-0 leading-relaxed text-gray-300">{text}</p>
                    <footer className="mt-6 flex items-center gap-3">
                      <img
                        width={40}
                        height={40}
                        src={image}
                        alt={`Avatar of ${name}`}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 transition-all duration-300 ease-in-out group-hover:ring-brand-yellow/50"
                      />
                      <div className="flex flex-col">
                        <cite className="not-italic leading-5 tracking-tight text-white">{name}</cite>
                        <span className="mt-0.5 text-sm leading-5 tracking-tight text-gray-400">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.ul>
    </div>
  )
}

const TestimonialV2 = () => {
  return (
    <section aria-labelledby="testimonials-heading" className="relative overflow-hidden bg-transparent py-10">
      <motion.div
        initial={{ opacity: 0, y: 50, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          opacity: { duration: 0.8 },
        }}
        className="container z-10 mx-auto px-4"
      >
        <div className="mx-auto mb-12 flex max-w-[540px] flex-col items-center justify-center">
          <div className="flex justify-center">
            <div className="rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300">
              Testimonials
            </div>
          </div>

          <h2
            id="testimonials-heading"
            className="mt-6 text-center text-4xl font-extrabold tracking-tight text-white md:text-5xl"
          >
            What our clients say
          </h2>
          <p className="mt-5 max-w-sm text-center text-lg leading-relaxed text-gray-400">
            Discover how teams streamline maintenance and operations with Optimal.
          </p>
        </div>

        <div
          className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
          role="region"
          aria-label="Scrolling Testimonials"
        >
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </motion.div>
    </section>
  )
}

export default TestimonialV2

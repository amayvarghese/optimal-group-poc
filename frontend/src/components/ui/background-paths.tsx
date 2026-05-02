'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from './Button'

export function BackgroundPaths({ title = 'Optimal Maintenance' }: { title?: string }) {
  const words = title.split(' ')

  return (
    <div className="relative w-full overflow-hidden bg-brand-black">
      <div className="relative aspect-[696/316] min-h-[420px] w-full max-h-[calc(100svh-72px)]">
        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-4 py-14 text-center md:px-6 md:py-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mx-auto max-w-4xl"
          >
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              {words.map((word, wordIndex) => (
                <span key={wordIndex} className="mr-4 inline-block last:mr-0">
                  {word.split('').map((letter, letterIndex) => (
                    <motion.span
                      key={`${wordIndex}-${letterIndex}`}
                      initial={{ y: 42, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        delay: wordIndex * 0.08 + letterIndex * 0.02,
                        type: 'spring',
                        stiffness: 150,
                        damping: 20,
                      }}
                      className="inline-block bg-gradient-to-r from-white to-brand-yellow bg-clip-text text-transparent"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-sm text-gray-200 sm:text-base">
              We are the number 1 property management partner in the UK.
            </p>

            <div className="inline-block">
              <Button
                variant="primary"
                className="rounded-xl border border-brand-yellow/40 px-7 py-5 text-base font-semibold text-black hover:bg-yellow-300"
                aria-label="Discover Excellence"
              >
                <span>Discover Excellence</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

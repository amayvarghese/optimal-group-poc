'use client'

import { Player } from '@remotion/player'
import { Link } from 'react-router-dom'
import { Button } from './Button'
import { GridPixelateWipe } from './grid-pixelate-wipe'

function ScenePanel({
  label,
  subtitle,
  background,
}: {
  label: string
  subtitle: string
  background: string
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <div style={{ display: 'grid', gap: 14, textAlign: 'center', padding: '0 16px' }}>
        <span style={{ fontSize: 14, letterSpacing: '0.35em', opacity: 0.8 }}>{subtitle}</span>
        <span style={{ fontSize: 'clamp(38px, 9vw, 96px)', fontWeight: 800, letterSpacing: '-0.05em' }}>
          {label}
        </span>
      </div>
    </div>
  )
}

function GridPixelateWipeScene() {
  return (
    <GridPixelateWipe
      cols={12}
      rows={7}
      pattern="wave"
      transitionStart={6}
      transitionDuration={34}
      cellFadeFrames={5}
      from={
        <ScenePanel
          label="OPTIMAL"
          subtitle="SERVICE HIGHLIGHTS"
          background="linear-gradient(135deg, #0b0b0b 0%, #141414 55%, #1a1a1a 100%)"
        />
      }
      to={
        <ScenePanel
          label="MAINTENANCE"
          subtitle="FIT-OUT • FURNISHING"
          background="linear-gradient(135deg, #0b0b0b 0%, #131313 40%, #1f1a00 100%)"
        />
      }
    />
  )
}

export function HeroGridReveal() {
  return (
    <div className="relative w-full min-h-[calc(100svh-72px)] overflow-hidden bg-black">
      <Player
        component={GridPixelateWipeScene}
        durationInFrames={90}
        fps={30}
        compositionWidth={1280}
        compositionHeight={720}
        controls={false}
        autoPlay
        loop
        clickToPlay={false}
        style={{ width: '100%', height: 'calc(100svh - 72px)' }}
      />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-14">
        <Link to="/login" className="pointer-events-auto" aria-label="Get started and login with Microsoft">
          <Button variant="primary" className="rounded-xl px-8 py-6 text-base font-semibold text-black">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  )
}

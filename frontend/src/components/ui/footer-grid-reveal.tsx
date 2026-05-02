'use client'

import { Player } from '@remotion/player'
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
      <div style={{ display: 'grid', gap: 12, textAlign: 'center', padding: '0 16px' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.35em', opacity: 0.75 }}>{subtitle}</span>
        <span style={{ fontSize: 'clamp(28px, 8vw, 64px)', fontWeight: 800, letterSpacing: '-0.05em' }}>
          {label}
        </span>
      </div>
    </div>
  )
}

function FooterGridScene() {
  return (
    <GridPixelateWipe
      cols={12}
      rows={5}
      pattern="diagonal"
      transitionStart={8}
      transitionDuration={30}
      cellFadeFrames={5}
      from={
        <ScenePanel
          label="GET IN TOUCH"
          subtitle="OPTIMAL MAINTENANCE"
          background="linear-gradient(135deg, #0b0b0b 0%, #141414 100%)"
        />
      }
      to={
        <ScenePanel
          label="LET'S BUILD BETTER"
          subtitle="PROPERTY OPERATIONS"
          background="linear-gradient(135deg, #0b0b0b 0%, #1d1802 100%)"
        />
      }
    />
  )
}

export function FooterGridReveal() {
  return (
    <footer id="contact" className="relative mt-8 h-[360px] w-full overflow-hidden border-t border-white/10 bg-black">
      <Player
        component={FooterGridScene}
        durationInFrames={90}
        fps={30}
        compositionWidth={1280}
        compositionHeight={420}
        controls={false}
        autoPlay
        loop
        clickToPlay={false}
        style={{ width: '100%', height: '100%' }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-gradient-to-t from-black/70 to-transparent px-4 pb-6 pt-16 text-center">
        <p className="text-sm text-brand-yellow">support@optimalmaintenance.co.uk</p>
        <p className="text-xs text-gray-300">0208 004 4442</p>
      </div>
    </footer>
  )
}

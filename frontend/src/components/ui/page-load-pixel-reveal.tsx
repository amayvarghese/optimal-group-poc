'use client'

import { useEffect, useMemo, useState } from 'react'

export function PageLoadPixelReveal() {
  const cols = 14
  const rows = 8
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(true)

  const delays = useMemo(() => {
    const centerX = (cols - 1) / 2
    const centerY = (rows - 1) / 2
    const raw: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const d = Math.hypot(x - centerX, y - centerY)
        raw[y][x] = d
        if (d < min) min = d
        if (d > max) max = d
      }
    }

    const range = max - min || 1
    return raw.map((row) => row.map((v) => ((v - min) / range) * 0.65))
  }, [])

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const durationMs = 1050

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      setProgress(t)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setVisible(false), 120)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  if (!visible) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-50 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: rows * cols }).map((_, i) => {
        const y = Math.floor(i / cols)
        const x = i % cols
        const delay = delays[y][x]
        const opacity = progress < delay ? 1 : Math.max(0, 1 - (progress - delay) / 0.28)
        return <div key={i} style={{ background: '#f9be01', opacity }} />
      })}
    </div>
  )
}

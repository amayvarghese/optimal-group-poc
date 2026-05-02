import type { PropsWithChildren } from 'react'

export const AuthGridBackground = ({ children }: PropsWithChildren) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(249,190,1,0.14),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:56px_56px] opacity-30" />
      <div className="relative z-10 w-full max-w-lg">{children}</div>
    </main>
  )
}

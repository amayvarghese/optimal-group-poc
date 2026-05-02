import { GooeyText } from './gooey-text-morphing'
import { Button } from './Button'
import { Link } from 'react-router-dom'

export function GooeyTextDemo() {
  return (
    <div className="flex h-[230px] w-full max-w-6xl flex-col items-center justify-center px-4">
      <div className="-mt-6 flex w-full justify-center">
        <GooeyText
          texts={['Property Maintenance', 'Fit-Out Works', 'Furnishing', 'Residential Operations']}
          morphTime={1}
          cooldownTime={0.3}
          className="h-[120px] w-full font-bold"
        />
      </div>
      <Link to="/login" aria-label="Get started and login with Microsoft">
        <Button variant="primary" className="mt-14 rounded-xl px-7 py-5 text-base font-semibold text-black">
          Get Started
        </Button>
      </Link>
    </div>
  )
}

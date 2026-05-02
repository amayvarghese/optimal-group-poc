import { InfiniteSlider } from './infinite-slider'
import { cn } from '../../lib/utils'

type Logo = {
  src: string
  alt: string
  width?: number
  height?: number
}

type LogoCloudProps = React.ComponentProps<'div'> & {
  logos: Logo[]
}

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  return (
    <div
      {...props}
      className={cn(
        'overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]',
        className,
      )}
    >
      <InfiniteSlider gap={64} reverse duration={40} durationOnHover={80}>
        {logos.map((logo) => (
          <img
            alt={logo.alt}
            className="pointer-events-none h-20 w-auto select-none object-contain opacity-95 grayscale invert brightness-125 contrast-125 md:h-28"
            height={logo.height || 'auto'}
            key={`logo-${logo.alt}`}
            loading="lazy"
            src={logo.src}
            width={logo.width || 'auto'}
          />
        ))}
      </InfiniteSlider>
    </div>
  )
}

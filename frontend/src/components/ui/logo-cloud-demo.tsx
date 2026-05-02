import { LogoCloud } from './logo-cloud-3'
import berkeleyLogo from '../../assets/client-logos/Berkeley_Group_Holdings_logo.svg.png'
import griLogo from '../../assets/client-logos/GRI.L_BIG-33eaedcb.png'
import landsecLogo from '../../assets/client-logos/Landsec-Logo.wine.png'
import segroLogo from '../../assets/client-logos/SEGRO_logo.svg'
import taylorWimpeyLogo from '../../assets/client-logos/Taylor_Wimpey_logo.svg.png'
import britishLandLogo from '../../assets/client-logos/british-land-BW.webp'
import ppmLogo from '../../assets/client-logos/cropped-PPM-Logo-1-1.png'
import firstportLogo from '../../assets/client-logos/firstport-1.png'
import barratHomesLogo from '../../assets/client-logos/logo-barrat-homes.png'

const logos = [
  { src: berkeleyLogo, alt: 'Berkeley Group Logo' },
  { src: griLogo, alt: 'Grainger Logo' },
  { src: landsecLogo, alt: 'Landsec Logo' },
  { src: segroLogo, alt: 'SEGRO Logo' },
  { src: taylorWimpeyLogo, alt: 'Taylor Wimpey Logo' },
  { src: britishLandLogo, alt: 'British Land Logo' },
  { src: ppmLogo, alt: 'PPM Logo' },
  { src: firstportLogo, alt: 'Firstport Logo' },
  { src: barratHomesLogo, alt: 'Barratt Homes Logo' },
]

export function LogoCloudDemo() {
  return (
    <section className="relative mx-auto w-full max-w-7xl">
      <h2 className="mb-14 text-center text-3xl font-medium tracking-tight text-white md:text-5xl">
        <span className="text-gray-400">Trusted by experts.</span>
        <br />
        <span className="font-semibold text-brand-yellow">Used by the leaders.</span>
      </h2>
      <div className="mx-auto my-12 h-px max-w-sm bg-white/15 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
      <LogoCloud logos={logos} />
      <div className="mt-8 h-px bg-white/15 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
    </section>
  )
}

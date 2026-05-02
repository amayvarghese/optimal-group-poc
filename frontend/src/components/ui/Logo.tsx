import logo from '../../assets/optimal-group-logo.png'

interface LogoProps {
  className?: string
}

export const Logo = ({ className = '' }: LogoProps) => {
  return (
    <img
      src={logo}
      alt="Optimal Group logo"
      className={`h-auto w-full max-w-[320px] object-contain ${className}`}
    />
  )
}

import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className, size = 36 }: LogoProps) {
  return (
    <div className={className}>
      <Image src="/light.svg" alt="Omakasem" width={size} height={size} className="dark:hidden" />
      <Image src="/dark.svg" alt="Omakasem" width={size} height={size} className="hidden dark:block" />
    </div>
  )
}

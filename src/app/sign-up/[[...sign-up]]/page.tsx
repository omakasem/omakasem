import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mb-8">
        <Image src="/light.svg" alt="Omakasem" width={48} height={48} className="dark:hidden" />
        <Image src="/dark.svg" alt="Omakasem" width={48} height={48} className="hidden dark:block" />
      </div>
      <SignUp />
    </div>
  )
}

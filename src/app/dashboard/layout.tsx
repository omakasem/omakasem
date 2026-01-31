import { getCurricula } from '@/lib/curricula'
import { ApplicationLayout } from './application-layout'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const curricula = await getCurricula()

  return <ApplicationLayout curricula={curricula}>{children}</ApplicationLayout>
}

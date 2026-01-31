import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-zinc-400">페이지를 찾을 수 없습니다</p>
      <Link
        href="/"
        className="rounded-full bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-200"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}

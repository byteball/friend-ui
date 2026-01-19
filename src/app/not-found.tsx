import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Obyte friends - Not Found',
  description: 'The page you are looking for does not exist.',
  robots: { index: false, follow: false },
}

export default () => <div className="mx-auto mt-20 max-w-2xl text-center sm:mt-24">
  <p className="text-base/8 font-semibold text-[#60A5FA]">404</p>
  <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-6xl">
    This page does not exist
  </h1>

  <div className="mt-10 flex justify-center">
    <Link href="/" className="text-sm/6 font-semibold text-[#60A5FA]">
      <span aria-hidden="true">&larr;</span> Back to home
    </Link>
  </div>
</div>

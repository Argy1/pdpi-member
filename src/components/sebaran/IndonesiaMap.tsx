import { lazy, Suspense } from 'react'

interface IndonesiaMapProps {
  filters: {
    q?: string
    provinsi?: string
    pd?: string
    kota?: string
    status?: string
    gender?: string
  }
}

const IndonesiaMapClient = lazy(() => import('./IndonesiaMapClient'))

export default function IndonesiaMap({ filters }: IndonesiaMapProps) {
  return (
    <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden">
      <Suspense
        fallback={
          <div className="h-full w-full rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
        }
      >
        <IndonesiaMapClient filters={filters} />
      </Suspense>
    </div>
  )
}

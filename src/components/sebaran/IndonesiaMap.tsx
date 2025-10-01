import { lazy, Suspense } from 'react'

const IndonesiaMapClient = lazy(() => import('./IndonesiaMapClient'))

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

export default function IndonesiaMap({ filters }: IndonesiaMapProps) {
  return (
    <Suspense
      fallback={
        <div className="h-[56vh] md:h-[62vh] lg:h-[68vh] rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 animate-pulse flex items-center justify-center">
          <div className="text-slate-500 dark:text-slate-400 text-sm">Memuat peta...</div>
        </div>
      }
    >
      <IndonesiaMapClient filters={filters} />
    </Suspense>
  )
}

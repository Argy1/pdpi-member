import IndonesiaMapClient from './IndonesiaMapClient'

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
  return <IndonesiaMapClient filters={filters} />
}

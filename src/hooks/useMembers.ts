import { useState, useEffect } from 'react'
import { Member } from '@/types/member'
import { AnggotaAPI } from '@/pages/api/AnggotaAPI'

interface UseMembersOptions {
  query?: string
  provinsi?: string
  provinsi_kantor?: string[]
  pd?: string
  subspesialis?: string
  namaHurufDepan?: string[]
  hospitalType?: string[]
  kota?: string[]
  kota_kabupaten_kantor?: string[]
  status?: string
  sort?: string
  limit?: number
  page?: number
  scope?: 'public' | 'admin'
}

interface UseMembersResult {
  members: Member[]
  total: number
  totalPages: number
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useMembers(options: UseMembersOptions = {}): UseMembersResult {
  const [members, setMembers] = useState<Member[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await AnggotaAPI.getMembers({
        ...options,
        namaHurufDepan: options.namaHurufDepan?.join(','),
        hospitalType: options.hospitalType?.join(','),
        kota: options.kota?.join(','),
        provinsi_kantor: options.provinsi_kantor?.join(','),
        kota_kabupaten_kantor: options.kota_kabupaten_kantor?.join(','),
        scope: options.scope || 'public'
      })
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setMembers(result.data || [])
      setTotal(result.total || 0)
      setTotalPages(result.totalPages || 0)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch members'
      setError(errorMessage)
      console.error('Error fetching members:', err)
      // Set empty state on error
      setMembers([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [JSON.stringify(options)]) // Re-fetch when options change

  const refresh = async () => {
    await fetchMembers()
  }

  return {
    members,
    total,
    totalPages,
    loading,
    error,
    refresh
  }
}
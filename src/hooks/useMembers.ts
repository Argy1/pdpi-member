import { useState, useEffect } from 'react'
import { Member } from '@/types/member'
import { AnggotaAPI } from '@/pages/api/AnggotaAPI'

interface UseMembersOptions {
  query?: string
  provinsi?: string
  pd?: string
  subspesialis?: string
  status?: string
  sort?: string
  limit?: number
  page?: number
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

      const result = await AnggotaAPI.getMembers(options)
      
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
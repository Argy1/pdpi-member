import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Member } from '@/types/member'
import { mockMembers } from '@/data/mockMembers'
import { supabase } from '@/integrations/supabase/client'

interface MemberContextType {
  members: Member[]
  addMember: (member: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateMember: (id: string, member: Partial<Member>) => Promise<void>
  deleteMember: (id: string) => Promise<void>
  resetMembers: () => void
  loading: boolean
  importExcelData: (data: any[]) => Promise<void>
}

const MemberContext = createContext<MemberContextType | undefined>(undefined)

export const useMemberContext = () => {
  const context = useContext(MemberContext)
  if (!context) {
    throw new Error('useMemberContext must be used within a MemberProvider')
  }
  return context
}

export function MemberProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching members:', error)
        // Fallback to mock data if database fails
        setMembers(mockMembers)
      } else {
        setMembers(data as Member[] || [])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setMembers(mockMembers)
    } finally {
      setLoading(false)
    }
  }

  const addMember = async (newMember: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([newMember])
        .select()
        .single()

      if (error) {
        console.error('Error adding member:', error)
        throw error
      }

      setMembers(prev => [data as Member, ...prev])
    } catch (error) {
      console.error('Error adding member:', error)
      throw error
    }
  }

  const updateMember = async (id: string, updatedMember: Partial<Member>) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .update(updatedMember)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating member:', error)
        throw error
      }

      setMembers(prev => prev.map(member => 
        member.id === id ? data as Member : member
      ))
    } catch (error) {
      console.error('Error updating member:', error)
      throw error
    }
  }

  const deleteMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting member:', error)
        throw error
      }

      setMembers(prev => prev.filter(member => member.id !== id))
    } catch (error) {
      console.error('Error deleting member:', error)
      throw error
    }
  }

  const resetMembers = () => {
    setMembers(mockMembers)
    localStorage.removeItem('pdpi-members')
  }

  const importExcelData = async (data: any[]) => {
    try {
      const { error } = await supabase
        .from('members')
        .insert(data)

      if (error) {
        console.error('Error importing Excel data:', error)
        throw error
      }

      await fetchMembers() // Refresh the members list
    } catch (error) {
      console.error('Error importing Excel data:', error)
      throw error
    }
  }

  return (
    <MemberContext.Provider value={{ 
      members, 
      addMember, 
      updateMember, 
      deleteMember, 
      resetMembers, 
      loading,
      importExcelData
    }}>
      {children}
    </MemberContext.Provider>
  )
}
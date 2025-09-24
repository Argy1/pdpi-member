import React, { createContext, useContext, ReactNode } from 'react';
import { useMemberSync } from '@/hooks/useMemberSync';
import { Member } from '@/types/member';

interface MemberSyncContextType {
  member: Member | null;
  loading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
}

const MemberSyncContext = createContext<MemberSyncContextType | undefined>(undefined);

export const useMemberSyncContext = () => {
  const context = useContext(MemberSyncContext);
  if (context === undefined) {
    throw new Error('useMemberSyncContext must be used within a MemberSyncProvider');
  }
  return context;
};

interface MemberSyncProviderProps {
  children: ReactNode;
}

export function MemberSyncProvider({ children }: MemberSyncProviderProps) {
  const { member, loading, error, syncStatus } = useMemberSync();

  const value = {
    member,
    loading,
    error,
    syncStatus
  };

  return (
    <MemberSyncContext.Provider value={value}>
      {children}
    </MemberSyncContext.Provider>
  );
}
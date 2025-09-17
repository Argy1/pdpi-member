import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Member } from '@/types/member';
import { mockMembers } from '@/data/mockMembers';

interface MemberContextType {
  members: Member[];
  addMember: (memberData: any) => void;
  updateMember: (id: string, memberData: any) => void;
  deleteMember: (id: string) => void;
}

const MemberContext = createContext<MemberContextType | undefined>(undefined);

export const useMemberContext = () => {
  const context = useContext(MemberContext);
  if (!context) {
    throw new Error('useMemberContext must be used within a MemberProvider');
  }
  return context;
};

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(mockMembers);

  const addMember = (memberData: any) => {
    const newMember: Member = {
      id: String(Date.now()), // Simple ID generation
      nama: memberData.nama || '',
      gelar: memberData.gelar || '',
      npa: memberData.npa || '',
      spesialis: memberData.spesialis || '',
      subspesialis: memberData.subspesialis || '',
      tempatLahir: memberData.tempatLahir || '',
      tanggalLahir: memberData.tanggalLahir ? memberData.tanggalLahir.toISOString().split('T')[0] : '',
      jenisKelamin: memberData.jenisKelamin === 'Laki-laki' ? 'L' : 'P',
      alamat: memberData.alamat || '',
      kota: memberData.kota || '',
      provinsi: memberData.provinsi || '',
      pd: memberData.pd || '',
      rumahSakit: memberData.rumahSakit || '',
      unitKerja: memberData.unitKerja || '',
      jabatan: memberData.jabatan || '',
      nik: memberData.nik || '',
      noSTR: memberData.noSTR || '',
      strBerlakuSampai: memberData.strBerlakuSampai ? memberData.strBerlakuSampai.toISOString().split('T')[0] : '',
      noSIP: memberData.noSIP || '',
      sipBerlakuSampai: memberData.sipBerlakuSampai ? memberData.sipBerlakuSampai.toISOString().split('T')[0] : '',
      tahunLulus: memberData.tahunLulus ? parseInt(memberData.tahunLulus) : undefined,
      status: memberData.status === 'Aktif' ? 'AKTIF' : memberData.status === 'Tidak Aktif' ? 'TIDAK_AKTIF' : 'PENDING',
      kontakEmail: memberData.kontakEmail || '',
      kontakTelepon: memberData.kontakTelepon || '',
      website: memberData.website || '',
      sosialMedia: memberData.sosialMedia || '',
      fotoUrl: memberData.foto || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id: string, memberData: any) => {
    setMembers(prev => prev.map(member => 
      member.id === id 
        ? { 
            ...member, 
            ...memberData,
            updatedAt: new Date().toISOString()
          }
        : member
    ));
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(member => member.id !== id));
  };

  return (
    <MemberContext.Provider value={{ members, addMember, updateMember, deleteMember }}>
      {children}
    </MemberContext.Provider>
  );
};
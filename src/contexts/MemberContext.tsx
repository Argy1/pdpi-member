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

    console.log('Adding new member:', newMember);
    setMembers(prev => {
      const updatedMembers = [...prev, newMember];
      console.log('Updated members after add:', updatedMembers);
      return updatedMembers;
    });
  };

  const updateMember = (id: string, memberData: any) => {
    setMembers(prev => prev.map(member => 
      member.id === id 
        ? { 
            ...member, 
            nama: memberData.nama || member.nama,
            gelar: memberData.gelar || member.gelar,
            npa: memberData.npa || member.npa,
            spesialis: memberData.spesialis || member.spesialis,
            subspesialis: memberData.subspesialis || member.subspesialis,
            tempatLahir: memberData.tempatLahir || member.tempatLahir,
            tanggalLahir: memberData.tanggalLahir ? memberData.tanggalLahir.toISOString().split('T')[0] : member.tanggalLahir,
            jenisKelamin: memberData.jenisKelamin === 'Laki-laki' ? 'L' : memberData.jenisKelamin === 'Perempuan' ? 'P' : member.jenisKelamin,
            alamat: memberData.alamat || member.alamat,
            kota: memberData.kota || member.kota,
            provinsi: memberData.provinsi || member.provinsi,
            pd: memberData.pd || member.pd,
            rumahSakit: memberData.rumahSakit || member.rumahSakit,
            unitKerja: memberData.unitKerja || member.unitKerja,
            jabatan: memberData.jabatan || member.jabatan,
            nik: memberData.nik || member.nik,
            noSTR: memberData.noSTR || member.noSTR,
            strBerlakuSampai: memberData.strBerlakuSampai ? memberData.strBerlakuSampai.toISOString().split('T')[0] : member.strBerlakuSampai,
            noSIP: memberData.noSIP || member.noSIP,
            sipBerlakuSampai: memberData.sipBerlakuSampai ? memberData.sipBerlakuSampai.toISOString().split('T')[0] : member.sipBerlakuSampai,
            tahunLulus: memberData.tahunLulus ? parseInt(memberData.tahunLulus) : member.tahunLulus,
            status: memberData.status === 'Aktif' ? 'AKTIF' : memberData.status === 'Tidak Aktif' ? 'TIDAK_AKTIF' : memberData.status === 'Pending' ? 'PENDING' : member.status,
            kontakEmail: memberData.kontakEmail || member.kontakEmail,
            kontakTelepon: memberData.kontakTelepon || member.kontakTelepon,
            website: memberData.website || member.website,
            sosialMedia: memberData.sosialMedia || member.sosialMedia,
            fotoUrl: memberData.foto || member.fotoUrl,
            updatedAt: new Date().toISOString()
          }
        : member
    ));
  };

  const deleteMember = (id: string) => {
    console.log('Deleting member with id:', id);
    setMembers(prev => {
      const updatedMembers = prev.filter(member => member.id !== id);
      console.log('Updated members after delete:', updatedMembers);
      return updatedMembers;
    });
  };

  return (
    <MemberContext.Provider value={{ members, addMember, updateMember, deleteMember }}>
      {children}
    </MemberContext.Provider>
  );
};
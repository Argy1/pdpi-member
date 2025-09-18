import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useMemberContext } from '@/contexts/MemberContext';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelMember {
  CABANG?: string;
  STATUS?: string;
  NPA?: string;
  NAMA?: string;
  'JENIS KELAMIN'?: string;
  'GELAR 1'?: string;
  'GELAR 2'?: string;
  'TEMPAT LAHIR'?: string;
  'TGL LAHIR'?: string;
  ALUMNI?: string;
  'THN LULUS'?: string;
  'TEMPAT TUGAS/RS'?: string;
  'KOTA/KABUPATEN'?: string;
  PROVINSI?: string;
  'ALAMAT RUMAH/KORESPONDENSI'?: string;
  'KOTA/KABUPATEN_RUMAH'?: string;
  PROVINSI_RUMAH?: string;
  'NO HP'?: string;
  EMAIL?: string;
  'KETERANGAN/STATUS KEANGGOTAAN'?: string;
}

export const ExcelImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addMember } = useMemberContext();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.includes('sheet') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Format File Tidak Valid",
          description: "Silakan pilih file Excel (.xls atau .xlsx)",
          variant: "destructive",
        });
      }
    }
  };

  const parseExcelData = (data: any[]): ExcelMember[] => {
    // Skip header rows and find the actual data
    const startIndex = data.findIndex(row => 
      row && typeof row === 'object' && 
      (row['NAMA'] || row['Nama'] || row['nama'] || 
       Object.values(row).some(val => typeof val === 'string' && val.includes('Dr.')))
    );
    
    if (startIndex === -1) return [];
    
    return data.slice(startIndex).filter(row => 
      row && typeof row === 'object' && 
      (row['NAMA'] || row['Nama'] || row['nama'] || 
       Object.values(row).some(val => typeof val === 'string' && val.includes('Dr.')))
    );
  };

  const mapExcelToMember = (excelMember: any): any => {
    // Map Excel columns to member fields with proper case handling
    const nama = excelMember['NAMA'] || excelMember['Nama'] || excelMember['nama'] || '';
    const gelar1 = excelMember['GELAR 1'] || excelMember['Gelar 1'] || excelMember['gelar 1'] || 
                   excelMember['GELAR'] || excelMember['Gelar'] || excelMember['gelar'] || '';
    const gelar2 = excelMember['GELAR 2'] || excelMember['Gelar 2'] || excelMember['gelar 2'] || '';
    const npa = excelMember['NPA'] || excelMember['Npa'] || excelMember['npa'] || '';
    const jenisKelamin = excelMember['JENIS KELAMIN'] || excelMember['Jenis Kelamin'] || excelMember['jenis kelamin'] || 
                        excelMember['JENIS_KELAMIN'] || excelMember['Jenis_Kelamin'] || excelMember['jenis_kelamin'] || '';
    const tempatLahir = excelMember['TEMPAT LAHIR'] || excelMember['Tempat Lahir'] || excelMember['tempat lahir'] ||
                       excelMember['KOTA_LAHIR'] || excelMember['Kota_Lahir'] || excelMember['kota_lahir'] || '';
    const tanggalLahir = excelMember['TGL LAHIR'] || excelMember['Tgl Lahir'] || excelMember['tgl lahir'] ||
                        excelMember['TGL_LAHIR'] || excelMember['Tgl_Lahir'] || excelMember['tgl_lahir'] || '';
    const alumni = excelMember['ALUMNI'] || excelMember['Alumni'] || excelMember['alumni'] || '';
    const tahunLulus = excelMember['THN LULUS'] || excelMember['Thn Lulus'] || excelMember['thn lulus'] ||
                      excelMember['TAHUN_LULUS'] || excelMember['Tahun_Lulus'] || excelMember['tahun_lulus'] || '';
    const tempatTugas = excelMember['TEMPAT TUGAS/RS'] || excelMember['Tempat Tugas/Rs'] || excelMember['tempat tugas/rs'] ||
                       excelMember['RS_KERJA'] || excelMember['Rs_Kerja'] || excelMember['rs_kerja'] || '';
    const kota = excelMember['KOTA/KABUPATEN'] || excelMember['Kota/Kabupaten'] || excelMember['kota/kabupaten'] ||
                excelMember['KOTA_KERJA'] || excelMember['Kota_Kerja'] || excelMember['kota_kerja'] || '';
    const provinsi = excelMember['PROVINSI'] || excelMember['Provinsi'] || excelMember['provinsi'] ||
                    excelMember['PROVINSI_KERJA'] || excelMember['Provinsi_Kerja'] || excelMember['provinsi_kerja'] || '';
    const alamatRumah = excelMember['ALAMAT RUMAH/KORESPONDENSI'] || excelMember['Alamat Rumah/Korespondensi'] || 
                       excelMember['alamat rumah/korespondensi'] || excelMember['ALAMAT'] || excelMember['Alamat'] || excelMember['alamat'] || '';
    const kotaRumah = excelMember['KOTA/KABUPATEN_RUMAH'] || excelMember['Kota/Kabupaten_Rumah'] || excelMember['kota/kabupaten_rumah'] ||
                     excelMember['KOTA_TINGGAL'] || excelMember['Kota_Tinggal'] || excelMember['kota_tinggal'] || '';
    const provinsiRumah = excelMember['PROVINSI_RUMAH'] || excelMember['Provinsi_Rumah'] || excelMember['provinsi_rumah'] ||
                         excelMember['PROVINSI_TINGGAL'] || excelMember['Provinsi_Tinggal'] || excelMember['provinsi_tinggal'] || '';
    const telepon = excelMember['NO HP'] || excelMember['No Hp'] || excelMember['no hp'] ||
                   excelMember['TELEPON'] || excelMember['Telepon'] || excelMember['telepon'] || '';
    const email = excelMember['EMAIL'] || excelMember['Email'] || excelMember['email'] || '';
    const cabang = excelMember['CABANG'] || excelMember['Cabang'] || excelMember['cabang'] || '';
    const status = excelMember['STATUS'] || excelMember['Status'] || excelMember['status'] || 'AKTIF';
    const keteranganStatus = excelMember['KETERANGAN/STATUS KEANGGOTAAN'] || excelMember['Keterangan/Status Keanggotaan'] || 
                            excelMember['keterangan/status keanggotaan'] || '';

    // Convert gender format
    let convertedGender = '';
    if (jenisKelamin.toString().toUpperCase() === 'L' || jenisKelamin.toString().toLowerCase().includes('laki')) {
      convertedGender = 'L';
    } else if (jenisKelamin.toString().toUpperCase() === 'P' || jenisKelamin.toString().toLowerCase().includes('perempuan')) {
      convertedGender = 'P';
    }

    return {
      nama: nama.toString().trim(),
      gelar: gelar1.toString().trim(),
      gelar2: gelar2.toString().trim(),
      npa: npa.toString().trim(),
      jenisKelamin: convertedGender,
      tempatLahir: tempatLahir.toString().trim(),
      tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
      alumni: alumni.toString().trim(),
      tahunLulus: tahunLulus ? parseInt(tahunLulus.toString()) : undefined,
      tempatTugas: tempatTugas.toString().trim(),
      rumahSakit: tempatTugas.toString().trim(),
      kota: kota.toString().trim(),
      provinsi: provinsi.toString().trim(),
      alamatRumah: alamatRumah.toString().trim(),
      alamat: alamatRumah.toString().trim(),
      kotaRumah: kotaRumah.toString().trim(),
      provinsiRumah: provinsiRumah.toString().trim(),
      kontakTelepon: telepon.toString().trim(),
      kontakEmail: email.toString().trim(),
      pd: cabang.toString().trim(),
      status: status.toString().toUpperCase() === 'AKTIF' ? 'AKTIF' : 
              status.toString().toUpperCase() === 'TIDAK AKTIF' || status.toString().toUpperCase() === 'TIDAK_AKTIF' ? 'TIDAK_AKTIF' : 'AKTIF',
      keteranganStatus: keteranganStatus.toString().trim()
    };
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "File Tidak Dipilih",
        description: "Silakan pilih file Excel terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    setProgress(0);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Convert array data to object format
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];
      
      const objectData = rows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      const excelMembers = parseExcelData(objectData);
      
      if (excelMembers.length === 0) {
        toast({
          title: "Data Tidak Ditemukan",
          description: "Tidak ada data anggota yang valid dalam file Excel",
          variant: "destructive",
        });
        setIsImporting(false);
        return;
      }

      let importedCount = 0;
      const totalMembers = excelMembers.length;

      for (let i = 0; i < excelMembers.length; i++) {
        const excelMember = excelMembers[i];
        const memberData = mapExcelToMember(excelMember);
        
        if (memberData.nama) {
          addMember(memberData);
          importedCount++;
        }
        
        setProgress(((i + 1) / totalMembers) * 100);
        
        // Add small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      toast({
        title: "Import Berhasil",
        description: `${importedCount} anggota berhasil diimport dari total ${totalMembers} data`,
      });

      setFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Error importing Excel:', error);
      toast({
        title: "Import Gagal",
        description: "Terjadi kesalahan saat mengimport file Excel",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Import Anggota dari Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="excel-file">Pilih File Excel</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileChange}
            disabled={isImporting}
          />
          <p className="text-sm text-muted-foreground">
            Format yang didukung: .xls, .xlsx
          </p>
        </div>

        {file && (
          <div className="p-3 bg-secondary rounded-md">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {isImporting && (
          <div className="space-y-2">
            <p className="text-sm">Mengimport data...</p>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">{Math.round(progress)}% selesai</p>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">Format Excel yang Diharapkan:</p>
            <ul className="mt-1 text-xs space-y-1">
              <li>• <strong>Cabang</strong> - Nama cabang/wilayah</li>
              <li>• <strong>Status</strong> - Status keanggotaan</li>
              <li>• <strong>NPA</strong> - Nomor Peserta Anggota</li>
              <li>• <strong>Nama</strong> - Nama lengkap anggota</li>
              <li>• <strong>Jenis Kelamin</strong> - L/P atau Laki-laki/Perempuan</li>
              <li>• <strong>Gelar 1</strong> & <strong>Gelar 2</strong> - Gelar akademik/profesi</li>
              <li>• <strong>Tempat Lahir</strong> & <strong>Tgl Lahir</strong> - Data kelahiran</li>
              <li>• <strong>Alumni</strong> & <strong>Thn Lulus</strong> - Riwayat pendidikan</li>
              <li>• <strong>Tempat Tugas/RS</strong> - Tempat kerja saat ini</li>
              <li>• <strong>Kota/Kabupaten</strong> & <strong>Provinsi</strong> - Lokasi kerja</li>
              <li>• <strong>Alamat Rumah/Korespondensi</strong> - Alamat tempat tinggal</li>
              <li>• <strong>No HP</strong> & <strong>Email</strong> - Kontak</li>
              <li>• <strong>Keterangan/Status Keanggotaan</strong> - Catatan tambahan</li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={handleImport} 
          disabled={!file || isImporting}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? 'Mengimport...' : 'Import Data Excel'}
        </Button>
      </CardContent>
    </Card>
  );
};
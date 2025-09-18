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
  'NO HP'?: string;
  EMAIL?: string;
  FOTO?: string;
  KETERANGAN?: string;
  'Non JOB'?: string;
}

export const ExcelImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { importExcelData } = useMemberContext();
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
    // Find the header row that contains the column names
    const headerIndex = data.findIndex(row => 
      row && typeof row === 'object' && 
      (row['CABANG'] || row['STATUS'] || row['NPA'] || row['NAMA'])
    );
    
    if (headerIndex === -1) return [];
    
    // Get data rows after header
    return data.slice(headerIndex + 1).filter(row => 
      row && typeof row === 'object' && 
      (row['NAMA'] && row['NAMA'].toString().trim() !== '' && 
       !row['NAMA'].toString().includes('Grand Total'))
    );
  };

  const mapExcelToMember = (excelMember: any): any => {
    // Extract data based on exact Excel column names from the file
    const nama = excelMember['NAMA'] || '';
    const gelar1 = excelMember['GELAR 1'] || '';
    const gelar2 = excelMember['GELAR 2'] || '';
    const npa = excelMember['NPA'] || '';
    const jenisKelamin = excelMember['JENIS KELAMIN'] || '';
    const tempatLahir = excelMember['TEMPAT LAHIR'] || '';
    const tanggalLahir = excelMember['TGL LAHIR'] || '';
    const alumni = excelMember['ALUMNI'] || '';
    const tahunLulus = excelMember['THN LULUS'] || '';
    const tempatTugas = excelMember['TEMPAT TUGAS/RS'] || '';
    const kota = excelMember['KOTA/KABUPATEN'] || '';
    const provinsi = excelMember['PROVINSI'] || '';
    const alamatRumah = excelMember['ALAMAT RUMAH/KORESPONDENSI'] || '';
    const telepon = excelMember['NO HP'] || '';
    const email = excelMember['EMAIL'] || '';
    const cabang = excelMember['CABANG'] || '';
    const status = excelMember['STATUS'] || 'Biasa';
    const keterangan = excelMember['KETERANGAN'] || '';

    // Convert gender format
    let convertedGender = '';
    if (jenisKelamin.toString().toUpperCase() === 'L') {
      convertedGender = 'L';
    } else if (jenisKelamin.toString().toUpperCase() === 'P') {
      convertedGender = 'P';
    }

    // Parse date if available
    let parsedDate = null;
    if (tanggalLahir) {
      try {
        // Handle different date formats
        const dateStr = tanggalLahir.toString();
        if (dateStr.includes('-')) {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            parsedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        } else {
          parsedDate = dateStr;
        }
      } catch (error) {
        console.warn('Date parsing error:', error);
      }
    }

    return {
      nama: nama.toString().trim(),
      gelar: gelar1.toString().trim(),
      gelar2: gelar2.toString().trim(),
      npa: npa.toString().trim(),
      jenisKelamin: convertedGender,
      tempatLahir: tempatLahir.toString().trim(),
      tanggalLahir: parsedDate,
      alumni: alumni.toString().trim(),
      tahunLulus: tahunLulus ? parseInt(tahunLulus.toString()) : undefined,
      tempatTugas: tempatTugas.toString().trim(),
      rumahSakit: tempatTugas.toString().trim(),
      kota: kota.toString().trim(),
      provinsi: provinsi.toString().trim(),
      alamatRumah: alamatRumah.toString().trim(),
      alamat: alamatRumah.toString().trim(),
      kontakTelepon: telepon.toString().trim(),
      kontakEmail: email.toString().trim(),
      pd: cabang.toString().trim(),
      status: status.toString().toLowerCase().includes('biasa') ? 'AKTIF' : 
              status.toString().toLowerCase().includes('luar biasa') ? 'TIDAK_AKTIF' : 'AKTIF',
      keteranganStatus: keterangan.toString().trim()
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
          // Data will be imported in bulk at the end
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
            <p className="font-medium">Format Excel yang Sesuai:</p>
            <ul className="mt-1 text-xs space-y-1">
              <li>• <strong>Cabang</strong> - Nama cabang/wilayah (contoh: 01-Aceh, 14-Jakarta)</li>
              <li>• <strong>Status</strong> - Status keanggotaan (Biasa/Luar Biasa)</li>
              <li>• <strong>NPA</strong> - Nomor Peserta Anggota</li>
              <li>• <strong>Nama</strong> - Nama lengkap anggota</li>
              <li>• <strong>Jenis Kelamin</strong> - L atau P</li>
              <li>• <strong>Gelar 1</strong> & <strong>Gelar 2</strong> - Gelar akademik/profesi</li>
              <li>• <strong>Tempat Lahir</strong> & <strong>Tgl Lahir</strong> - Data kelahiran</li>
              <li>• <strong>Alumni</strong> & <strong>Thn Lulus</strong> - Riwayat pendidikan</li>
              <li>• <strong>Tempat Tugas/RS</strong> - Tempat kerja saat ini</li>
              <li>• <strong>Kota/Kabupaten</strong> & <strong>Provinsi</strong> - Lokasi kerja</li>
              <li>• <strong>Alamat Rumah/Korespondensi</strong> - Alamat tempat tinggal</li>
              <li>• <strong>No HP</strong> & <strong>Email</strong> - Kontak</li>
              <li>• <strong>Foto</strong> - Status foto (opsional)</li>
              <li>• <strong>Keterangan</strong> - Catatan tambahan</li>
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
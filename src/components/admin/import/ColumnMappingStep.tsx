import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImport } from '@/contexts/ImportContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Wand2, Eye, AlertTriangle } from 'lucide-react';

// Database field definitions - using actual database column names
const dbFields = {
  // Required fields
  nama: { label: 'Nama Lengkap', required: true, type: 'text' },
  tempat_tugas: { label: 'Tempat Tugas/RS/Fasyankes', required: false, type: 'text' },
  
  
  // Optional fields (but important)
  rumahSakit: { label: 'Rumah Sakit (alternatif)', required: false, type: 'text' },
  cabang: { label: 'Cabang/PD/Wilayah', required: false, type: 'text' },
  
  // Other optional fields - using actual database column names
  npa: { label: 'NPA (Nomor Peserta Anggota)', required: false, type: 'text' },
  gelar: { label: 'Gelar 1', required: false, type: 'text' },
  gelar2: { label: 'Gelar 2', required: false, type: 'text' },
  alumni: { label: 'Alumni', required: false, type: 'text' },
  jenis_kelamin: { label: 'Jenis Kelamin (L/P)', required: false, type: 'text' },
  tempat_lahir: { label: 'Tempat Lahir', required: false, type: 'text' },
  tgl_lahir: { label: 'Tanggal Lahir', required: false, type: 'date' },
  alamat_rumah: { label: 'Alamat Rumah', required: false, type: 'text' },
  kota_kabupaten_kantor: { label: 'Kota/Kabupaten Kantor', required: false, type: 'text' },
  provinsi_kantor: { label: 'Provinsi Kantor', required: false, type: 'text' },
  kota_kabupaten_rumah: { label: 'Kota/Kabupaten Rumah', required: false, type: 'text' },
  provinsi_rumah: { label: 'Provinsi Rumah', required: false, type: 'text' },
  thn_lulus: { label: 'Tahun Lulus', required: false, type: 'number' },
  status: { label: 'Status Keanggotaan (Biasa/Luar Biasa/Meninggal/Muda)', required: false, type: 'text' },
  email: { label: 'Email', required: false, type: 'email' },
  no_hp: { label: 'Nomor HP/Telepon', required: false, type: 'text' },
  foto: { label: 'Foto URL', required: false, type: 'text' },
  keterangan: { label: 'Keterangan', required: false, type: 'text' },
  tempat_praktek_1: { label: 'Tempat Praktek 1', required: false, type: 'text' },
  tempat_praktek_1_tipe: { label: 'Tipe Tempat Praktek 1 (Paripurna/Utama/Madya/Dasar/Klinik Pribadi)', required: false, type: 'text' },
  tempat_praktek_1_tipe_2: { label: 'Tipe RS 2 - Praktek 1 (RS Tipe A/RS Tipe B/RS Tipe C/Klinik Pribadi)', required: false, type: 'text' },
  tempat_praktek_2: { label: 'Tempat Praktek 2', required: false, type: 'text' },
  tempat_praktek_2_tipe: { label: 'Tipe Tempat Praktek 2 (Paripurna/Utama/Madya/Dasar/Klinik Pribadi)', required: false, type: 'text' },
  tempat_praktek_2_tipe_2: { label: 'Tipe RS 2 - Praktek 2 (RS Tipe A/RS Tipe B/RS Tipe C/Klinik Pribadi)', required: false, type: 'text' },
  tempat_praktek_3: { label: 'Tempat Praktek 3', required: false, type: 'text' },
  tempat_praktek_3_tipe: { label: 'Tipe Tempat Praktek 3 (Paripurna/Utama/Madya/Dasar/Klinik Pribadi)', required: false, type: 'text' },
  tempat_praktek_3_tipe_2: { label: 'Tipe RS 2 - Praktek 3 (RS Tipe A/RS Tipe B/RS Tipe C/Klinik Pribadi)', required: false, type: 'text' }
};

export const ColumnMappingStep = () => {
  const { 
    fileData, 
    columnMapping, 
    setColumnMapping, 
    setCurrentStep, 
    setValidationErrors 
  } = useImport();
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);

  // Auto-map columns based on similarity
  const autoMapColumns = () => {
    if (!fileData) return;
    
    const newMapping: any = {};
    const normalizeHeader = (header: string) => 
      header.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Mapping rules based on common header names - updated to match database columns
    const mappingRules: { [key: string]: string[] } = {
      nama: ['nama', 'namalengkap', 'name', 'fullname'],
      npa: ['npa', 'nomoranggota', 'memberid', 'id'],
      gelar: ['gelar', 'gelar1', 'title', 'degree'],
      gelar2: ['gelar2', 'title2', 'degree2', 'gelardua'],
      alumni: ['alumni', 'almamater', 'sekolah'],
      tempat_tugas: ['tempattugas', 'rumahsakit', 'rs', 'fasyankes', 'instansi', 'tempatpraktik', 'hospital', 'tempatkerja', 'workplace'],
      rumahSakit: ['rumahsakit', 'rs', 'hospital', 'tempatkerja', 'workplace'],
      kota_kabupaten_kantor: ['kota', 'kabupaten', 'kotakabupaten', 'city', 'kotakab', 'kotakantor', 'kabupatenkantor'],
      kota_kabupaten_rumah: ['kotarumah', 'kabupatanrumah', 'kotakabupatanrumah', 'cityhome'],
      provinsi_kantor: ['provinsi', 'province', 'prop', 'provinsikantor'],
      provinsi_rumah: ['provinsirumah', 'provincehome', 'prophome'],
      cabang: ['cabang', 'pd', 'wilayah', 'branch', 'region'],
      jenis_kelamin: ['jeniskelamin', 'kelamin', 'gender', 'jk'],
      tempat_praktek_1: ['tempatpraktek1', 'praktek1', 'rstipea', 'rumahsakittipea', 'hospitala', 'rs1', 'rumahsakit1', 'tempatpraktik1', 'praktik1', 'rstipea', 'rsatype', 'typea', 'tipea'],
      tempat_praktek_1_tipe: ['tipetempatpraktek1', 'tipepraktek1', 'tipe1', 'tipepraktik1', 'jenispraktek1', 'kategoripraktek1', 'tiperstipea', 'tipers1', 'jenisrstipea', 'tipehospital1'],
      tempat_praktek_1_tipe_2: ['tipers2praktek1', 'tipers21', 'tipeRS2praktek1', 'tipeRS21', 'rstype2praktek1', 'rstype21', 'tiperstipe2praktek1', 'tiperstipe21', 'rstipea2', 'tiperstipea2', 'kategoriRS2praktek1', 'kategoriRS21'],
      tempat_praktek_2: ['tempatpraktek2', 'praktek2', 'rstipeb', 'rumahsakittipeb', 'hospitalb', 'rs2', 'rumahsakit2', 'tempatpraktik2', 'praktik2', 'rstipeb', 'rsbtype', 'typeb', 'tipeb'],
      tempat_praktek_2_tipe: ['tipetempatpraktek2', 'tipepraktek2', 'tipe2', 'tipepraktik2', 'jenispraktek2', 'kategoripraktek2', 'tiperstipeb', 'tipers2', 'jenisrstipeb', 'tipehospital2'],
      tempat_praktek_2_tipe_2: ['tipers2praktek2', 'tipers22', 'tipeRS2praktek2', 'tipeRS22', 'rstype2praktek2', 'rstype22', 'tiperstipe2praktek2', 'tiperstipe22', 'rstipeb2', 'tiperstipeb2', 'kategoriRS2praktek2', 'kategoriRS22'],
      tempat_praktek_3: ['tempatpraktek3', 'praktek3', 'rstipec', 'rumahsakittipec', 'hospitalc', 'rs3', 'rumahsakit3', 'tempatpraktik3', 'praktik3', 'rstipec', 'rsctype', 'typec', 'tipec', 'klinikpribadi', 'klinik'],
      tempat_praktek_3_tipe: ['tipetempatpraktek3', 'tipepraktek3', 'tipe3', 'tipepraktik3', 'jenispraktek3', 'kategoripraktek3', 'tiperstipec', 'tipers3', 'jenisrstipec', 'tipehospital3', 'tipeklinik'],
      tempat_praktek_3_tipe_2: ['tipers2praktek3', 'tipers23', 'tipeRS2praktek3', 'tipeRS23', 'rstype2praktek3', 'rstype23', 'tiperstipe2praktek3', 'tiperstipe23', 'rstipec2', 'tiperstipec2', 'kategoriRS2praktek3', 'kategoriRS23'],
      tempat_lahir: ['tempatlahir', 'birthplace'],
      tgl_lahir: ['tanggallahir', 'tgllahir', 'birthdate', 'dob'],
      alamat_rumah: ['alamat', 'alamatrumah', 'address', 'addresshome'],
      thn_lulus: ['tahunlulus', 'thnlulus', 'graduate', 'graduation'],
      status: ['status', 'statuskeanggotaan', 'membership', 'keanggotaan'],
      email: ['email', 'mail', 'emailaddress', 'kontakemail'],
      no_hp: ['nohp', 'telepon', 'telp', 'hp', 'phone', 'mobile', 'kontaktelepon'],
      foto: ['foto', 'photo', 'picture', 'image'],
      keterangan: ['keterangan', 'notes', 'catatan', 'remarks']
    };

    fileData.headers.forEach((header, index) => {
      const normalizedHeader = normalizeHeader(header);
      
      // Find matching db field
      for (const [dbField, variants] of Object.entries(mappingRules)) {
        if (variants.some(variant => normalizedHeader.includes(variant))) {
          newMapping[header] = dbField;
          break;
        }
      }
    });

    setColumnMapping(newMapping);
    toast({
      title: 'Auto-mapping berhasil',
      description: `${Object.keys(newMapping).length} kolom berhasil dimapping secara otomatis`
    });
  };

  // Validate mapping
  const validateMapping = () => {
    const requiredFields = ['nama']; // Only nama is required now
    const mappedFields = Object.values(columnMapping);
    
    // Check required fields
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      setValidationErrors([{
        type: 'missing_required',
        message: `Field wajib belum dimapping: ${missingRequired.map(f => dbFields[f as keyof typeof dbFields].label).join(', ')}`
      }]);
      return false;
    }
    
    // Check if practice location fields are mapped
    const practiceFields = ['tempat_praktek_1', 'tempat_praktek_1_tipe', 'tempat_praktek_1_tipe_2', 'tempat_praktek_2', 'tempat_praktek_2_tipe', 'tempat_praktek_2_tipe_2', 'tempat_praktek_3', 'tempat_praktek_3_tipe', 'tempat_praktek_3_tipe_2'];
    const mappedPracticeFields = practiceFields.filter(field => mappedFields.includes(field));
    
      if (mappedPracticeFields.length === 0) {
        console.warn('⚠️ Peringatan: Tidak ada field tempat praktek yang dimapping. Data tempat praktek tidak akan tersimpan.');
      } else if (mappedPracticeFields.length < 9) {
        console.warn(`⚠️ Peringatan: Hanya ${mappedPracticeFields.length}/9 field tempat praktek yang dimapping:`, mappedPracticeFields);
      }
    
    setValidationErrors([]);
    return true;
  };

  const handleNext = () => {
    if (validateMapping()) {
      setCurrentStep(3);
    } else {
      toast({
        title: 'Mapping belum lengkap',
        description: 'Harap mapping semua field yang wajib diisi',
        variant: 'destructive'
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  if (!fileData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Data file tidak ditemukan. Silakan kembali ke langkah upload file.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate required fields mapping status
  const mappedFields = Object.values(columnMapping);
  const hasNama = mappedFields.includes('nama');
  
  const requiredFieldsMapped = [
    hasNama
  ].filter(Boolean).length;
  
  const totalRequiredFields = 1; // Only nama is required
  
  // Check tempat_tugas empty percentage for preview warning
  const getTempatTugasEmptyPercentage = () => {
    if (!showPreview || !fileData) return 0;
    
    const tempatTugasCol = Object.keys(columnMapping).find(col => columnMapping[col] === 'tempat_tugas');
    if (!tempatTugasCol) return 100; // If not mapped, consider 100% empty
    
    const colIndex = fileData.headers.indexOf(tempatTugasCol);
    if (colIndex === -1) return 100;
    
    const emptyCount = fileData.previewRows.filter(row => !row[colIndex] || String(row[colIndex]).trim() === '').length;
    return (emptyCount / fileData.previewRows.length) * 100;
  };
  
  const tempatTugasEmptyPercentage = getTempatTugasEmptyPercentage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mapping Kolom</h3>
          <p className="text-sm text-muted-foreground">
            Petakan kolom dari file Excel ke field database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={autoMapColumns} variant="outline" size="sm">
            <Wand2 className="h-4 w-4 mr-2" />
            Auto-map
          </Button>
          <Button 
            onClick={() => setShowPreview(!showPreview)} 
            variant="outline" 
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Sembunyikan' : 'Preview'}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Field wajib dimapping:</span>
          <Badge variant={requiredFieldsMapped === totalRequiredFields ? "default" : "destructive"}>
            {requiredFieldsMapped} / {totalRequiredFields}
          </Badge>
        </div>
        
        {/* Required fields breakdown */}
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={hasNama ? "default" : "outline"} className="text-xs">
            Nama {hasNama ? '✓' : '✗'}
          </Badge>
        </div>
      </div>

      {/* Warning for missing required fields */}
      {requiredFieldsMapped < totalRequiredFields && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Field wajib belum lengkap:</strong>
            <ul className="mt-1 ml-4 list-disc text-sm">
              {!hasNama && <li>Nama Lengkap harus dimapping</li>}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for empty tempat_tugas */}
      {showPreview && tempatTugasEmptyPercentage >= 10 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Peringatan:</strong> {Math.round(tempatTugasEmptyPercentage)}% data Tempat Tugas kosong. 
            Pastikan data lengkap untuk hasil import yang optimal.
          </AlertDescription>
        </Alert>
      )}

      {/* Warning for practice location fields */}
      {(() => {
        const practiceFields = ['tempat_praktek_1', 'tempat_praktek_1_tipe', 'tempat_praktek_1_tipe_2', 'tempat_praktek_2', 'tempat_praktek_2_tipe', 'tempat_praktek_2_tipe_2', 'tempat_praktek_3', 'tempat_praktek_3_tipe', 'tempat_praktek_3_tipe_2'];
        const mappedPracticeFields = practiceFields.filter(field => mappedFields.includes(field));
        
        if (mappedPracticeFields.length === 0) {
          return (
            <Alert className="border-orange-500/50 bg-orange-500/10">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-orange-900 dark:text-orange-100">
                <strong>Perhatian:</strong> Tidak ada field Tempat Praktek yang dimapping. 
                Data tempat praktek (Paripurna/Utama/Madya/Dasar/Klinik Pribadi dan RS Tipe A/B/C) tidak akan tersimpan ke database.
                <div className="mt-2 text-sm">
                  Pastikan Anda memetakan kolom berikut jika ada di Excel:
                  <ul className="ml-4 mt-1 list-disc">
                    <li>Tempat Praktek 1, 2, 3</li>
                    <li>Tipe Tempat Praktek 1, 2, 3 (Tipe RS 1)</li>
                    <li>Tipe RS 2 - Praktek 1, 2, 3</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          );
        } else if (mappedPracticeFields.length < 9 && mappedPracticeFields.length > 0) {
          const missingFields = practiceFields.filter(field => !mappedFields.includes(field));
          return (
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <AlertTriangle className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-900 dark:text-blue-100">
                <strong>Info:</strong> {mappedPracticeFields.length}/9 field tempat praktek dimapping.
                <div className="mt-1 text-sm">
                  Field yang belum dimapping: {missingFields.map(f => dbFields[f as keyof typeof dbFields]?.label || f).join(', ')}
                </div>
              </AlertDescription>
            </Alert>
          );
        }
        return null;
      })()}

      {/* Mapping Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pemetaan Kolom</CardTitle>
          <CardDescription>
            Pilih field database yang sesuai untuk setiap kolom di file Excel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kolom Excel</TableHead>
                  <TableHead>Contoh Data</TableHead>
                  <TableHead>Field Database</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fileData.headers.map((header, index) => {
                  const exampleData = fileData.previewRows[0]?.[index] || '-';
                  const mappedField = columnMapping[header];
                  const isRequired = mappedField && dbFields[mappedField as keyof typeof dbFields]?.required;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{header}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                        {String(exampleData)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={columnMapping[header] || ""}
                          onValueChange={(value) => {
                            const newMapping = { ...columnMapping };
                            if (value === "skip") {
                              delete newMapping[header];
                            } else {
                              newMapping[header] = value;
                            }
                            setColumnMapping(newMapping);
                          }}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Pilih field atau skip" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">
                              <span className="text-muted-foreground">Skip kolom ini</span>
                            </SelectItem>
                            {Object.entries(dbFields).map(([fieldKey, fieldConfig]) => (
                              <SelectItem key={fieldKey} value={fieldKey}>
                                <div className="flex items-center gap-2">
                                  <span>{fieldConfig.label}</span>
                                  {fieldConfig.required && (
                                    <Badge variant="destructive" className="text-xs">
                                      Wajib
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {mappedField ? (
                          <Badge variant={isRequired ? "default" : "secondary"}>
                            {isRequired ? 'Mapped (Wajib)' : 'Mapped'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Skip</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Data */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Data (100 baris pertama)</CardTitle>
            <CardDescription>
              Preview data setelah mapping kolom
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.values(columnMapping).map((field) => (
                      <TableHead key={field}>
                        {dbFields[field as keyof typeof dbFields]?.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fileData.previewRows.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Object.entries(columnMapping).map(([excelCol, dbField]) => {
                        const colIndex = fileData.headers.indexOf(excelCol);
                        const value = row[colIndex];
                        return (
                          <TableCell key={dbField} className="max-w-32 truncate">
                            {String(value || '-')}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={requiredFieldsMapped < totalRequiredFields}
          className={requiredFieldsMapped < totalRequiredFields ? "opacity-50 cursor-not-allowed" : ""}
        >
          {requiredFieldsMapped < totalRequiredFields 
            ? `Mapping belum lengkap (${requiredFieldsMapped}/${totalRequiredFields})`
            : 'Lanjutkan ke Import'
          }
        </Button>
      </div>
    </div>
  );
};
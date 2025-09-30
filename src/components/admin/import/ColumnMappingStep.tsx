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
  tempat_tugas: { label: 'Tempat Tugas/RS/Fasyankes', required: true, type: 'text' },
  
  
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
  rs_tipe_a: { label: 'RS Tipe A', required: false, type: 'text' },
  rs_tipe_b: { label: 'RS Tipe B', required: false, type: 'text' },
  rs_tipe_c: { label: 'RS Tipe C', required: false, type: 'text' },
  klinik_pribadi: { label: 'Klinik Pribadi', required: false, type: 'text' }
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
      tempat_lahir: ['tempatlahir', 'birthplace'],
      tgl_lahir: ['tanggallahir', 'tgllahir', 'birthdate', 'dob'],
      alamat_rumah: ['alamat', 'alamatrumah', 'address', 'addresshome'],
      thn_lulus: ['tahunlulus', 'thnlulus', 'graduate', 'graduation'],
      status: ['status', 'statuskeanggotaan', 'membership', 'keanggotaan'],
      email: ['email', 'mail', 'emailaddress', 'kontakemail'],
      no_hp: ['nohp', 'telepon', 'telp', 'hp', 'phone', 'mobile', 'kontaktelepon'],
      foto: ['foto', 'photo', 'picture', 'image'],
      keterangan: ['keterangan', 'notes', 'catatan', 'remarks'],
      rs_tipe_a: ['rstipea', 'rumahsakittipea', 'hospitala'],
      rs_tipe_b: ['rstipeb', 'rumahsakittipeb', 'hospitalb'],
      rs_tipe_c: ['rstipec', 'rumahsakittipec', 'hospitalc'],
      klinik_pribadi: ['klinikpribadi', 'privateclinic', 'klinik']
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
    const requiredFields = ['nama', 'provinsi_kantor']; // Base required fields
    const mappedFields = Object.values(columnMapping);
    
    // Check if either tempat_tugas OR rumahSakit is mapped
    const hasTempatTugas = mappedFields.includes('tempat_tugas');
    const hasRumahSakit = mappedFields.includes('rumahSakit');
    
    if (!hasTempatTugas && !hasRumahSakit) {
      setValidationErrors([{
        type: 'missing_required',
        message: 'Wajib mapping: nama, provinsi kantor, dan tempat_tugas (atau rumahSakit sebagai alternatif)'
      }]);
      return false;
    }
    
    // Check other required fields
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      setValidationErrors([{
        type: 'missing_required',
        message: `Field wajib belum dimapping: ${missingRequired.map(f => dbFields[f as keyof typeof dbFields].label).join(', ')}`
      }]);
      return false;
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
  const hasProvinsi = mappedFields.includes('provinsi_kantor');
  const hasTempatTugas = mappedFields.includes('tempat_tugas');
  const hasRumahSakit = mappedFields.includes('rumahSakit');
  
  const requiredFieldsMapped = [
    hasNama,
    hasProvinsi,
    hasTempatTugas || hasRumahSakit
  ].filter(Boolean).length;
  
  const totalRequiredFields = 3; // nama, provinsi, tempat_tugas/rumahSakit
  
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
          <Badge variant={hasProvinsi ? "default" : "outline"} className="text-xs">
            Provinsi Kantor {hasProvinsi ? '✓' : '✗'}
          </Badge>
          <Badge variant={hasTempatTugas || hasRumahSakit ? "default" : "outline"} className="text-xs">
            Tempat Tugas {hasTempatTugas || hasRumahSakit ? '✓' : '✗'}
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
              {!hasProvinsi && <li>Provinsi Kantor harus dimapping</li>}
              {!hasTempatTugas && !hasRumahSakit && <li>Tempat Tugas/RS/Fasyankes atau Rumah Sakit harus dimapping</li>}
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
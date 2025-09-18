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

// Database field definitions
const dbFields = {
  // Required fields
  nama: { label: 'Nama Lengkap', required: true, type: 'text' },
  rumahSakit: { label: 'Rumah Sakit/Tempat Kerja', required: true, type: 'text' },
  kota: { label: 'Kota/Kabupaten', required: true, type: 'text' },
  provinsi: { label: 'Provinsi', required: true, type: 'text' },
  pd: { label: 'PD/Wilayah/Cabang', required: true, type: 'text' },
  
  // Optional fields
  npa: { label: 'NPA (Nomor Peserta Anggota)', required: false, type: 'text' },
  gelar: { label: 'Gelar', required: false, type: 'text' },
  spesialis: { label: 'Spesialis', required: false, type: 'text' },
  subspesialis: { label: 'Subspesialis', required: false, type: 'text' },
  jenisKelamin: { label: 'Jenis Kelamin (L/P)', required: false, type: 'text' },
  tempatLahir: { label: 'Tempat Lahir', required: false, type: 'text' },
  tanggalLahir: { label: 'Tanggal Lahir', required: false, type: 'date' },
  alamat: { label: 'Alamat', required: false, type: 'text' },
  unitKerja: { label: 'Unit Kerja', required: false, type: 'text' },
  jabatan: { label: 'Jabatan', required: false, type: 'text' },
  tahunLulus: { label: 'Tahun Lulus', required: false, type: 'number' },
  status: { label: 'Status (Aktif/Nonaktif)', required: false, type: 'text' },
  kontakEmail: { label: 'Email', required: false, type: 'email' },
  kontakTelepon: { label: 'Telepon/HP', required: false, type: 'text' },
  nik: { label: 'NIK', required: false, type: 'text' },
  noSTR: { label: 'No STR', required: false, type: 'text' },
  strBerlakuSampai: { label: 'STR Berlaku Sampai', required: false, type: 'date' },
  noSIP: { label: 'No SIP', required: false, type: 'text' },
  sipBerlakuSampai: { label: 'SIP Berlaku Sampai', required: false, type: 'date' },
  website: { label: 'Website', required: false, type: 'text' },
  sosialMedia: { label: 'Media Sosial', required: false, type: 'text' }
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
    
    // Mapping rules based on common header names
    const mappingRules: { [key: string]: string[] } = {
      nama: ['nama', 'namalengkap', 'name', 'fullname'],
      npa: ['npa', 'nomoranggota', 'memberid', 'id'],
      gelar: ['gelar', 'title', 'degree'],
      spesialis: ['spesialis', 'speciality', 'specialty', 'bidang'],
      subspesialis: ['subspesialis', 'subspecialty', 'subbidang'],
      rumahSakit: ['rumahsakit', 'rs', 'hospital', 'tempatkerja', 'workplace'],
      kota: ['kota', 'kabupaten', 'kotakabupaten', 'city'],
      provinsi: ['provinsi', 'province', 'prop'],
      pd: ['pd', 'wilayah', 'cabang', 'branch', 'region'],
      jenisKelamin: ['jeniskelamin', 'kelamin', 'gender', 'jk'],
      tempatLahir: ['tempatlahir', 'birthplace'],
      tanggalLahir: ['tanggallahir', 'tgllahir', 'birthdate', 'dob'],
      alamat: ['alamat', 'address'],
      unitKerja: ['unitkerja', 'unit', 'department'],
      jabatan: ['jabatan', 'position', 'job'],
      tahunLulus: ['tahunlulus', 'thnlulus', 'graduate', 'graduation'],
      status: ['status'],
      kontakEmail: ['email', 'mail', 'emailaddress'],
      kontakTelepon: ['telepon', 'telp', 'hp', 'phone', 'mobile'],
      nik: ['nik', 'identitas'],
      noSTR: ['str', 'nostr', 'nomorsurat'],
      noSIP: ['sip', 'nosip', 'nomorsipn']
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
    const requiredFields = Object.entries(dbFields)
      .filter(([_, config]) => config.required)
      .map(([field, _]) => field);
    
    const mappedFields = Object.values(columnMapping);
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

  const requiredFieldsMapped = Object.entries(dbFields)
    .filter(([_, config]) => config.required)
    .filter(([field, _]) => Object.values(columnMapping).includes(field))
    .length;
  
  const totalRequiredFields = Object.entries(dbFields)
    .filter(([_, config]) => config.required)
    .length;

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
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Field wajib dimapping:</span>
        <Badge variant={requiredFieldsMapped === totalRequiredFields ? "default" : "secondary"}>
          {requiredFieldsMapped} / {totalRequiredFields}
        </Badge>
      </div>

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
        <Button onClick={handleNext} disabled={requiredFieldsMapped < totalRequiredFields}>
          Lanjutkan ke Import
        </Button>
      </div>
    </div>
  );
};
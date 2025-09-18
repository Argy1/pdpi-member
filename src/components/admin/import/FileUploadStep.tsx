import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImport } from '@/contexts/ImportContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, AlertCircle, Info } from 'lucide-react';
import * as XLSX from 'xlsx';

export const FileUploadStep = () => {
  const { setFileData, setCurrentStep, fileData } = useImport();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      let workbook: XLSX.WorkBook;
      let jsonData: any[];
      
      if (file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(arrayBuffer);
        workbook = XLSX.read(text, { type: 'string' });
      } else {
        workbook = XLSX.read(arrayBuffer);
      }

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Filter out empty rows
      const filteredData = rawData.filter((row: any) => 
        row && Array.isArray(row) && row.some((cell: any) => cell !== null && cell !== undefined && cell !== '')
      ) as any[][];

      if (filteredData.length < 2) {
        throw new Error('File harus memiliki minimal 1 baris header dan 1 baris data');
      }

      const headers = filteredData[0].map((header: any) => String(header || '').trim());
      const rows = filteredData.slice(1);
      const previewRows = rows.slice(0, 100); // First 100 rows for preview

      const processedData = {
        file,
        headers,
        rows,
        previewRows
      };

      setFileData(processedData);
      
      toast({
        title: 'File berhasil diproses',
        description: `Ditemukan ${headers.length} kolom dan ${rows.length} baris data`
      });

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error memproses file',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses file',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false
  });

  const handleNext = () => {
    if (fileData) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Pilih file Excel (.xlsx, .xls) atau CSV yang berisi data anggota
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-4">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg">Lepaskan file di sini...</p>
              ) : (
                <>
                  <p className="text-lg">Drag & drop file di sini, atau klik untuk pilih file</p>
                  <p className="text-sm text-muted-foreground">
                    Mendukung .xlsx, .xls, .csv (maksimal 25MB)
                  </p>
                </>
              )}
              {isProcessing && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Memproses file...</span>
                </div>
              )}
            </div>
          </div>

          {fileData && (
            <div className="mt-4 p-4 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{fileData.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {fileData.headers.length} kolom • {fileData.rows.length} baris data • 
                    {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button onClick={() => setFileData(null)} variant="outline" size="sm">
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Format */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Format Header yang Disarankan:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
              <span className="bg-background px-2 py-1 rounded">Nama</span>
              <span className="bg-background px-2 py-1 rounded">NPA</span>
              <span className="bg-background px-2 py-1 rounded">Spesialis</span>
              <span className="bg-background px-2 py-1 rounded">Subspesialis</span>
              <span className="bg-background px-2 py-1 rounded">Rumah Sakit</span>
              <span className="bg-background px-2 py-1 rounded">Kota</span>
              <span className="bg-background px-2 py-1 rounded">Provinsi</span>
              <span className="bg-background px-2 py-1 rounded">PD/Wilayah</span>
              <span className="bg-background px-2 py-1 rounded">Tahun Lulus</span>
              <span className="bg-background px-2 py-1 rounded">Status</span>
              <span className="bg-background px-2 py-1 rounded">Email</span>
              <span className="bg-background px-2 py-1 rounded">Telepon</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Example Data */}
      <Card>
        <CardHeader>
          <CardTitle>Contoh Format Data</CardTitle>
          <CardDescription>
            Berikut adalah contoh format data yang dapat diimport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-2 text-left">Nama</th>
                  <th className="border border-border p-2 text-left">NPA</th>
                  <th className="border border-border p-2 text-left">Spesialis</th>
                  <th className="border border-border p-2 text-left">Rumah Sakit</th>
                  <th className="border border-border p-2 text-left">Kota</th>
                  <th className="border border-border p-2 text-left">Provinsi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border p-2">Dr. Ahmad Suryadi, Sp.PD</td>
                  <td className="border border-border p-2">123456</td>
                  <td className="border border-border p-2">Penyakit Dalam</td>
                  <td className="border border-border p-2">RSUD Dr. Soetomo</td>
                  <td className="border border-border p-2">Surabaya</td>
                  <td className="border border-border p-2">Jawa Timur</td>
                </tr>
                <tr>
                  <td className="border border-border p-2">Dr. Siti Nurhaliza, Sp.JP</td>
                  <td className="border border-border p-2">234567</td>
                  <td className="border border-border p-2">Jantung dan Pembuluh Darah</td>
                  <td className="border border-border p-2">RS Harapan Kita</td>
                  <td className="border border-border p-2">Jakarta</td>
                  <td className="border border-border p-2">DKI Jakarta</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button 
          onClick={handleNext} 
          disabled={!fileData || isProcessing}
          className="px-8"
        >
          Lanjutkan ke Mapping
        </Button>
      </div>
    </div>
  );
};
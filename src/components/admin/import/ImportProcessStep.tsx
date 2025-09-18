import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useImport } from '@/contexts/ImportContext';
import { useMemberContext } from '@/contexts/MemberContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Play, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  FileDown
} from 'lucide-react';

export const ImportProcessStep = () => {
  const { 
    fileData, 
    columnMapping, 
    importSettings, 
    setImportSettings, 
    importProgress, 
    setImportProgress, 
    setCurrentStep,
    resetImport
  } = useImport();
  const { importExcelData } = useMemberContext();
  const { toast } = useToast();
  const [isStarted, setIsStarted] = useState(false);

  // Normalize and validate data
  const normalizeText = (text: string): string => {
    if (!text) return '';
    return text.toString().trim().replace(/[^\w\s-]/gi, '').toLowerCase();
  };

  const normalizeDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr === 'Kosong') return null;
    
    try {
      // Handle DD/MM/YYYY or DD-MM-YYYY format
      const parts = dateStr.toString().split(/[\/\-]/);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Handle YYYY-MM-DD format
      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const normalizeStatus = (status: string): string => {
    if (!status) return 'AKTIF';
    const normalized = status.toString().toLowerCase();
    if (normalized.includes('aktif') || normalized.includes('active')) return 'AKTIF';
    if (normalized.includes('nonaktif') || normalized.includes('inactive')) return 'TIDAK_AKTIF';
    return 'AKTIF';
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : null;
  };

  const processData = () => {
    if (!fileData) return [];
    
    const processedData = [];
    
    for (let i = 0; i < fileData.rows.length; i++) {
      const row = fileData.rows[i];
      const processedRow: any = {};
      
      // Map columns according to mapping
      Object.entries(columnMapping).forEach(([excelCol, dbField]) => {
        const colIndex = fileData.headers.indexOf(excelCol);
        const rawValue = row[colIndex];
        
        if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
          switch (dbField) {
            case 'tanggalLahir':
            case 'strBerlakuSampai':
            case 'sipBerlakuSampai':
              processedRow[dbField] = normalizeDate(rawValue);
              break;
            case 'status':
              processedRow[dbField] = normalizeStatus(rawValue);
              break;
            case 'kontakEmail':
              processedRow[dbField] = validateEmail(rawValue.toString());
              break;
            case 'tahunLulus':
              const year = parseInt(rawValue.toString());
              processedRow[dbField] = isNaN(year) ? null : year;
              break;
            case 'jenisKelamin':
              const gender = rawValue.toString().toUpperCase();
              processedRow[dbField] = (gender === 'L' || gender === 'P') ? gender : null;
              break;
            default:
              processedRow[dbField] = rawValue.toString().trim();
          }
        }
      });
      
      // Only include rows with required fields
      if (processedRow.nama && processedRow.rumahSakit && processedRow.kota && processedRow.provinsi) {
        processedData.push(processedRow);
      }
    }
    
    return processedData;
  };

  const handleStartImport = async () => {
    setIsStarted(true);
    const processedData = processData();
    
    setImportProgress({
      total: processedData.length,
      processed: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      isProcessing: true,
      isDone: false
    });

    try {
      // Import data in chunks
      const chunkSize = 500;
      let totalInserted = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      let totalErrors = 0;

      for (let i = 0; i < processedData.length; i += chunkSize) {
        const chunk = processedData.slice(i, i + chunkSize);
        
        try {
          await importExcelData(chunk);
          totalInserted += chunk.length;
        } catch (error) {
          console.error('Chunk import error:', error);
          totalErrors += chunk.length;
        }
        
        // Update progress
        setImportProgress({
          total: processedData.length,
          processed: Math.min(i + chunkSize, processedData.length),
          inserted: totalInserted,
          updated: totalUpdated,
          skipped: totalSkipped,
          errors: totalErrors,
          isProcessing: true,
          isDone: false
        });
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setImportProgress({
        total: processedData.length,
        processed: processedData.length,
        inserted: totalInserted,
        updated: totalUpdated,
        skipped: totalSkipped,
        errors: totalErrors,
        isProcessing: false,
        isDone: true
      });
      
      toast({
        title: 'Import selesai',
        description: `Berhasil mengimport ${totalInserted} anggota`
      });
      
    } catch (error) {
      console.error('Import error:', error);
      setImportProgress({
        total: processedData.length,
        processed: processedData.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: processedData.length,
        isProcessing: false,
        isDone: true
      });
      
      toast({
        title: 'Import gagal',
        description: 'Terjadi kesalahan saat mengimport data',
        variant: 'destructive'
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  const handleReset = () => {
    resetImport();
  };

  if (!fileData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Data tidak lengkap. Silakan mulai ulang proses import.
        </AlertDescription>
      </Alert>
    );
  }

  const processedData = processData();
  const progressPercentage = importProgress.total > 0 
    ? (importProgress.processed / importProgress.total) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Proses Import</h3>
        <p className="text-sm text-muted-foreground">
          Review pengaturan dan mulai proses import data
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{fileData.rows.length}</div>
            <p className="text-xs text-muted-foreground">Total baris di file</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{processedData.length}</div>
            <p className="text-xs text-muted-foreground">Baris valid untuk import</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Object.keys(columnMapping).length}</div>
            <p className="text-xs text-muted-foreground">Kolom yang dimapping</p>
          </CardContent>
        </Card>
      </div>

      {/* Import Settings */}
      {!isStarted && (
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Import</CardTitle>
            <CardDescription>
              Pilih mode import dan pengaturan lainnya
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-base font-medium">Mode Import</Label>
              <RadioGroup 
                value={importSettings.mode} 
                onValueChange={(value: any) => 
                  setImportSettings({ ...importSettings, mode: value })
                }
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="insert" id="insert" />
                  <Label htmlFor="insert">Insert baru - Lewati jika data sudah ada</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upsert" id="upsert" />
                  <Label htmlFor="upsert">Upsert - Update jika ada, insert jika baru</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="skip" id="skip" />
                  <Label htmlFor="skip">Skip duplikat - Hanya insert data baru</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="createBranch"
                checked={importSettings.createBranchIfMissing}
                onCheckedChange={(checked) => 
                  setImportSettings({ 
                    ...importSettings, 
                    createBranchIfMissing: checked as boolean 
                  })
                }
              />
              <Label htmlFor="createBranch">
                Buat cabang baru secara otomatis jika belum ada
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {isStarted && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Import</CardTitle>
            <CardDescription>
              Status proses import data anggota
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{importProgress.processed} / {importProgress.total} baris</span>
                <span>
                  {importProgress.isProcessing ? 'Memproses...' : 
                   importProgress.isDone ? 'Selesai' : 'Siap'}
                </span>
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importProgress.inserted}</div>
                <div className="text-xs text-muted-foreground">Berhasil</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{importProgress.updated}</div>
                <div className="text-xs text-muted-foreground">Diupdate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{importProgress.skipped}</div>
                <div className="text-xs text-muted-foreground">Dilewati</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importProgress.errors}</div>
                <div className="text-xs text-muted-foreground">Error</div>
              </div>
            </div>

            {importProgress.isDone && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import selesai! {importProgress.inserted} anggota berhasil diimport.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={handleBack} variant="outline" disabled={importProgress.isProcessing}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <div className="flex gap-2">
          {importProgress.isDone ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/admin/anggota'}
              >
                Lihat di Tabel Admin
              </Button>
              <Button onClick={handleReset}>
                Import File Lain
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleStartImport} 
              disabled={isStarted || processedData.length === 0}
              className="px-8"
            >
              <Play className="h-4 w-4 mr-2" />
              {importProgress.isProcessing ? 'Memproses...' : 'Mulai Import'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
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
import { useImport, ImportError } from '@/contexts/ImportContext';
import { useMemberContext } from '@/contexts/MemberContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  normalizeText, 
  createDuplicateKey, 
  normalizeBranchName, 
  normalizeDate, 
  normalizeStatus, 
  validateEmail,
  generateErrorCSV,
  downloadCSV 
} from '@/utils/importHelpers';
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
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  const processData = async () => {
    if (!fileData) return { validData: [], errors: [] };
    
    const processedData = [];
    const errors: ImportError[] = [];
    const duplicateKeys = new Set<string>();
    
    // Get existing branches
    const { data: branches } = await supabase.from('branches').select('id, name');
    const branchMap = new Map(branches?.map(b => [normalizeBranchName(b.name), b.id]) || []);
    
    // Get existing members for duplicate checking
    const { data: existingMembers } = await supabase
      .from('members')
      .select('npa, nama, tempat_tugas');
    
    const existingNPAs = new Set(existingMembers?.map(m => m.npa).filter(Boolean) || []);
    const existingDuplicateKeys = new Set(
      existingMembers?.map(m => createDuplicateKey(m.nama, m.tempat_tugas || '')) || []
    );
    
    for (let i = 0; i < fileData.rows.length; i++) {
      const row = fileData.rows[i];
      const processedRow: any = {};
      let hasError = false;
      
      // Map columns according to mapping
      Object.entries(columnMapping).forEach(([excelCol, dbField]) => {
        const colIndex = fileData.headers.indexOf(excelCol);
        const rawValue = row[colIndex];
        
        if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
          switch (dbField) {
            case 'tgl_lahir':
              processedRow[dbField] = normalizeDate(rawValue);
              break;
            case 'status':
              processedRow[dbField] = normalizeStatus(rawValue);
              break;
            case 'email':
              processedRow[dbField] = validateEmail(rawValue.toString());
              break;
            case 'thn_lulus':
              const year = parseInt(rawValue.toString());
              processedRow[dbField] = isNaN(year) ? null : year;
              break;
            case 'jenis_kelamin':
              const gender = rawValue.toString().toUpperCase();
              processedRow[dbField] = (gender === 'L' || gender === 'P') ? gender : null;
              break;
            default:
              processedRow[dbField] = rawValue.toString().trim();
          }
        }
      });
      
      // Set default status if empty
      if (!processedRow.status) {
        processedRow.status = 'Aktif';
      }
      
      // Validate required fields
      if (!processedRow.nama || !processedRow.tempat_tugas || !processedRow.provinsi) {
        errors.push({
          row: i + 2, // +2 for header row and 1-based indexing
          data: processedRow,
          reason: 'FIELD_REQUIRED',
          details: 'Missing required fields: nama, tempat_tugas, or provinsi'
        });
        continue;
      }
      
      // Handle branch mapping
      let cabangId = null;
      if (importSettings.forceAdminBranch) {
        // Force admin branch (will be set later when we have session)
        cabangId = 'ADMIN_BRANCH';
      } else if (processedRow.cabang) {
        const normalizedBranch = normalizeBranchName(processedRow.cabang);
        cabangId = branchMap.get(normalizedBranch);
        
        if (!cabangId && importSettings.createBranchIfMissing) {
          // Create new branch
          const { data: newBranch, error } = await supabase
            .from('branches')
            .insert({ name: processedRow.cabang })
            .select('id')
            .single();
            
          if (newBranch && !error) {
            cabangId = newBranch.id;
            branchMap.set(normalizedBranch, cabangId);
          }
        }
        
        if (!cabangId) {
          errors.push({
            row: i + 2,
            data: processedRow,
            reason: 'CABANG_TIDAK_DITEMUKAN',
            details: `Branch '${processedRow.cabang}' not found and createBranchIfMissing is disabled`
          });
          continue;
        }
      }
      
      // Handle duplicate checking
      const duplicateKey = processedRow.npa ? 
        processedRow.npa : 
        createDuplicateKey(processedRow.nama, processedRow.tempat_tugas);
      
      if (processedRow.npa) {
        if (existingNPAs.has(processedRow.npa) || duplicateKeys.has(processedRow.npa)) {
          if (importSettings.mode === 'skip') {
            errors.push({
              row: i + 2,
              data: processedRow,
              reason: 'DUPLICATE_NPA',
              details: `NPA ${processedRow.npa} already exists`
            });
            continue;
          }
        } else {
          duplicateKeys.add(processedRow.npa);
        }
      } else {
        if (existingDuplicateKeys.has(duplicateKey) || duplicateKeys.has(duplicateKey)) {
          if (importSettings.mode === 'skip') {
            errors.push({
              row: i + 2,
              data: processedRow,
              reason: 'DUPLICATE',
              details: `Duplicate combination: ${processedRow.nama} + ${processedRow.tempat_tugas}`
            });
            continue;
          }
        } else {
          duplicateKeys.add(duplicateKey);
        }
      }
      
      processedRow.cabang_id = cabangId;
      processedData.push(processedRow);
    }
    
    return { validData: processedData, errors };
  };

  const handleStartImport = async () => {
    setIsStarted(true);
    const { validData, errors } = await processData();
    
    setImportErrors(errors);
    
    setImportProgress({
      total: validData.length + errors.length,
      processed: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      duplicate: 0,
      invalid: errors.length,
      cabangTidakDitemukan: errors.filter(e => e.reason === 'CABANG_TIDAK_DITEMUKAN').length,
      npaNullUpsertError: 0,
      errors: 0,
      isProcessing: true,
      isDone: false
    });

    if (validData.length === 0) {
      setImportProgress({
        total: errors.length,
        processed: errors.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        duplicate: 0,
        invalid: errors.length,
        cabangTidakDitemukan: errors.filter(e => e.reason === 'CABANG_TIDAK_DITEMUKAN').length,
        npaNullUpsertError: 0,
        errors: 0,
        isProcessing: false,
        isDone: true
      });
      toast({
        title: 'Import selesai',
        description: `Tidak ada data valid untuk diimport. ${errors.length} baris error.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Import data in chunks
      const chunkSize = 500;
      let totalInserted = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;
      let totalDuplicate = 0;
      let totalNpaNullUpsertError = 0;
      let totalErrors = 0;

      for (let i = 0; i < validData.length; i += chunkSize) {
        const chunk = validData.slice(i, i + chunkSize);
        
        try {
          // Process each item individually for better error handling
          for (const item of chunk) {
            try {
              // Force admin branch if setting is enabled
              if (importSettings.forceAdminBranch) {
                // This would need session info - for now, we'll skip this
                // item.cabang_id = session.user.cabangId;
              }
              
              if (importSettings.mode === 'upsert') {
                const whereCondition = item.npa ? 
                  { npa: item.npa } : 
                  { 
                    nama: item.nama, 
                    tempat_tugas: item.tempat_tugas 
                  };
                
                const { data: existing } = await supabase
                  .from('members')
                  .select('id')
                  .match(whereCondition)
                  .single();
                
                if (existing) {
                  await supabase
                    .from('members')
                    .update(item)
                    .eq('id', existing.id);
                  totalUpdated++;
                } else {
                  await supabase
                    .from('members')
                    .insert(item);
                  totalInserted++;
                }
              } else if (importSettings.mode === 'insert') {
                const { error } = await supabase
                  .from('members')
                  .insert(item);
                
                if (error) {
                  if (error.code === '23505') { // Unique constraint violation
                    totalDuplicate++;
                  } else {
                    totalErrors++;
                  }
                } else {
                  totalInserted++;
                }
              }
            } catch (itemError) {
              console.error('Item import error:', itemError);
              totalErrors++;
            }
          }
        } catch (error) {
          console.error('Chunk import error:', error);
          totalErrors += chunk.length;
        }
        
        // Update progress
        setImportProgress({
          total: validData.length + errors.length,
          processed: Math.min(i + chunkSize, validData.length) + errors.length,
          inserted: totalInserted,
          updated: totalUpdated,
          skipped: totalSkipped,
          duplicate: totalDuplicate,
          invalid: errors.length,
          cabangTidakDitemukan: errors.filter(e => e.reason === 'CABANG_TIDAK_DITEMUKAN').length,
          npaNullUpsertError: totalNpaNullUpsertError,
          errors: totalErrors,
          isProcessing: true,
          isDone: false
        });
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setImportProgress({
        total: validData.length + errors.length,
        processed: validData.length + errors.length,
        inserted: totalInserted,
        updated: totalUpdated,
        skipped: totalSkipped,
        duplicate: totalDuplicate,
        invalid: errors.length,
        cabangTidakDitemukan: errors.filter(e => e.reason === 'CABANG_TIDAK_DITEMUKAN').length,
        npaNullUpsertError: totalNpaNullUpsertError,
        errors: totalErrors,
        isProcessing: false,
        isDone: true
      });
      
      toast({
        title: 'Import selesai',
        description: `Berhasil: ${totalInserted} insert, ${totalUpdated} update. Error: ${totalErrors + errors.length}`
      });
      
    } catch (error) {
      console.error('Import error:', error);
      setImportProgress({
        total: validData.length + importErrors.length,
        processed: validData.length + importErrors.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        duplicate: 0,
        invalid: importErrors.length,
        cabangTidakDitemukan: importErrors.filter(e => e.reason === 'CABANG_TIDAK_DITEMUKAN').length,
        npaNullUpsertError: 0,
        errors: validData.length,
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
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Baris valid (akan dihitung)</p>
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
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="forceAdminBranch"
                checked={importSettings.forceAdminBranch}
                onCheckedChange={(checked) => 
                  setImportSettings({ 
                    ...importSettings, 
                    forceAdminBranch: checked as boolean 
                  })
                }
              />
              <Label htmlFor="forceAdminBranch">
                Paksa cabang = cabang saya (ADMIN_CABANG)
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
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importProgress.inserted}</div>
                <div className="text-xs text-muted-foreground">Insert</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{importProgress.updated}</div>
                <div className="text-xs text-muted-foreground">Update</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{importProgress.duplicate}</div>
                <div className="text-xs text-muted-foreground">Duplikat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{importProgress.invalid}</div>
                <div className="text-xs text-muted-foreground">Invalid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{importProgress.cabangTidakDitemukan}</div>
                <div className="text-xs text-muted-foreground">Cabang Error</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importProgress.errors}</div>
                <div className="text-xs text-muted-foreground">System Error</div>
              </div>
            </div>

            {importProgress.isDone && (
              <div className="space-y-2">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Import selesai! {importProgress.inserted} insert, {importProgress.updated} update, {importProgress.errors + importProgress.invalid} error.
                  </AlertDescription>
                </Alert>
                
                {importErrors.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const csvContent = generateErrorCSV(importErrors);
                        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                        downloadCSV(csvContent, `import-errors-${timestamp}.csv`);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Unduh Log Error CSV
                    </Button>
                  </div>
                )}
              </div>
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
              disabled={isStarted}
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
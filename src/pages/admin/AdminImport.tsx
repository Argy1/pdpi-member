import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileSpreadsheet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImportStepper } from '@/components/admin/import/ImportStepper';
import { FileUploadStep } from '@/components/admin/import/FileUploadStep';
import { ColumnMappingStep } from '@/components/admin/import/ColumnMappingStep';
import { ImportProcessStep } from '@/components/admin/import/ImportProcessStep';
import { ImportProvider } from '@/contexts/ImportContext';

const AdminImport = () => {
  return (
    <ImportProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/anggota" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Manajemen Anggota
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Import Anggota</h1>
            <p className="text-muted-foreground">
              Import data anggota dari file Excel atau CSV
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Bulk Import Anggota PDPI
            </CardTitle>
            <CardDescription>
              Upload file Excel/CSV dan mapping kolom untuk import data anggota secara massal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportStepper />
          </CardContent>
        </Card>
      </div>
    </ImportProvider>
  );
};

export default AdminImport;
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ImportFileData {
  file: File;
  headers: string[];
  rows: any[][];
  previewRows: any[][];
}

export interface ColumnMapping {
  [excelColumn: string]: string; // maps excel column name to db field name
}

export interface ImportSettings {
  mode: 'insert' | 'upsert' | 'skip';
  createBranchIfMissing: boolean;
  forceAdminBranch: boolean;
}

export interface ImportProgress {
  total: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  duplicate: number;
  invalid: number;
  cabangTidakDitemukan: number;
  npaNullUpsertError: number;
  errors: number;
  isProcessing: boolean;
  isDone: boolean;
}

export interface ImportError {
  row: number;
  data: any;
  reason: string;
  details?: string;
}

interface ImportContextType {
  // Current step (1: upload, 2: mapping, 3: process)
  currentStep: number;
  setCurrentStep: (step: number) => void;
  
  // File data
  fileData: ImportFileData | null;
  setFileData: (data: ImportFileData | null) => void;
  
  // Column mapping
  columnMapping: ColumnMapping;
  setColumnMapping: (mapping: ColumnMapping) => void;
  
  // Import settings
  importSettings: ImportSettings;
  setImportSettings: (settings: ImportSettings) => void;
  
  // Progress tracking
  importProgress: ImportProgress;
  setImportProgress: (progress: ImportProgress) => void;
  
  // Validation errors
  validationErrors: any[];
  setValidationErrors: (errors: any[]) => void;
  
  // Reset all data
  resetImport: () => void;
}

const ImportContext = createContext<ImportContextType | undefined>(undefined);

export const useImport = () => {
  const context = useContext(ImportContext);
  if (!context) {
    throw new Error('useImport must be used within an ImportProvider');
  }
  return context;
};

export const ImportProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fileData, setFileData] = useState<ImportFileData | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [importSettings, setImportSettings] = useState<ImportSettings>({
    mode: 'insert',
    createBranchIfMissing: true,
    forceAdminBranch: false
  });
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    duplicate: 0,
    invalid: 0,
    cabangTidakDitemukan: 0,
    npaNullUpsertError: 0,
    errors: 0,
    isProcessing: false,
    isDone: false
  });
  const [validationErrors, setValidationErrors] = useState<any[]>([]);

  const resetImport = () => {
    setCurrentStep(1);
    setFileData(null);
    setColumnMapping({});
    setImportSettings({
      mode: 'insert',
      createBranchIfMissing: true,
      forceAdminBranch: false
    });
    setImportProgress({
      total: 0,
      processed: 0,
      inserted: 0,
      updated: 0,
      skipped: 0,
      duplicate: 0,
      invalid: 0,
      cabangTidakDitemukan: 0,
      npaNullUpsertError: 0,
      errors: 0,
      isProcessing: false,
      isDone: false
    });
    setValidationErrors([]);
  };

  return (
    <ImportContext.Provider value={{
      currentStep,
      setCurrentStep,
      fileData,
      setFileData,
      columnMapping,
      setColumnMapping,
      importSettings,
      setImportSettings,
      importProgress,
      setImportProgress,
      validationErrors,
      setValidationErrors,
      resetImport
    }}>
      {children}
    </ImportContext.Provider>
  );
};
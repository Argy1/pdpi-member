// Utility functions for import processing

export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text.toString()
    .toLowerCase()
    .trim()
    .replace(/^(dr\.?|dr\s)/i, '') // Remove "dr" or "dr." prefix
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
};

export const createDuplicateKey = (nama: string, rumahSakit: string): string => {
  const normNama = normalizeText(nama);
  const normRS = normalizeText(rumahSakit);
  return `${normNama}|${normRS}`;
};

export const normalizeBranchName = (branchName: string): string => {
  if (!branchName) return '';
  return branchName.trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
};

export const normalizeDate = (dateStr: string): string | null => {
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

export const normalizeStatus = (status: string): string => {
  if (!status) return 'Biasa';
  
  const normalized = status.toString().toLowerCase().trim();
  
  if (normalized.includes('luar biasa') || normalized.includes('luarbiasa')) return 'Luar Biasa';
  if (normalized.includes('meninggal')) return 'Meninggal';
  if (normalized.includes('muda')) return 'Muda';
  if (normalized.includes('biasa')) return 'Biasa';
  
  // Fallback for old format compatibility
  if (normalized.includes('aktif') || normalized.includes('active')) return 'Biasa';
  if (normalized.includes('nonaktif') || normalized.includes('inactive')) return 'Meninggal';
  
  return 'Biasa';
};

export const validateEmail = (email: string): string | null => {
  if (!email) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email : null;
};

export const generateErrorCSV = (errors: any[]): string => {
  if (errors.length === 0) return '';
  
  const headers = ['Baris', 'Alasan', 'Detail', 'Data'];
  const rows = errors.map(error => [
    error.row,
    error.reason,
    error.details || '',
    JSON.stringify(error.data)
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
    
  return csvContent;
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
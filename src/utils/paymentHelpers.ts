export const TARIFF_PER_YEAR = 1000000;
export const MAX_YEARS_PER_TRANSACTION = 5;

export const generateGroupCode = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-GRP-${year}-${random}`;
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export const calculateExpiry = (method: 'qris' | 'bank_transfer'): Date => {
  const now = new Date();
  if (method === 'qris') {
    // QRIS expires in 15 minutes
    now.setMinutes(now.getMinutes() + 15);
  } else {
    // Bank transfer expires in 24 hours
    now.setHours(now.getHours() + 24);
  }
  return now;
};

export const getAvailableYears = (paidYears: number[]): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  
  for (let i = 0; i < 10; i++) {
    const year = currentYear + i;
    if (!paidYears.includes(year)) {
      years.push(year);
    }
  }
  
  return years;
};

export const validateYearSelection = (years: number[], paidYears: number[]): { valid: boolean; error?: string } => {
  if (years.length === 0) {
    return { valid: false, error: 'Pilih minimal 1 tahun' };
  }
  
  if (years.length > MAX_YEARS_PER_TRANSACTION) {
    return { valid: false, error: `Maksimal ${MAX_YEARS_PER_TRANSACTION} tahun per transaksi` };
  }
  
  const hasPaidYear = years.some(y => paidYears.includes(y));
  if (hasPaidYear) {
    return { valid: false, error: 'Terdapat tahun yang sudah dibayar' };
  }
  
  return { valid: true };
};

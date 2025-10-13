import { z } from 'zod';

// Schema for member validation
export const memberSchema = z.object({
  nama: z.string()
    .trim()
    .min(1, 'Nama wajib diisi')
    .max(255, 'Nama maksimal 255 karakter'),
  
  npa: z.string()
    .trim()
    .max(50, 'NPA maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  email: z.string()
    .trim()
    .email('Format email tidak valid')
    .max(255, 'Email maksimal 255 karakter')
    .optional()
    .or(z.literal('')),
  
  no_hp: z.string()
    .trim()
    .regex(/^[0-9+\-\(\)\s]*$/, 'Format telepon tidak valid')
    .min(8, 'Nomor telepon minimal 8 digit')
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .optional()
    .or(z.literal('')),
  
  jenis_kelamin: z.enum(['L', 'P'])
    .optional()
    .or(z.literal('') as any),
  
  gelar: z.string()
    .trim()
    .max(50, 'Gelar maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  gelar2: z.string()
    .trim()
    .max(50, 'Gelar 2 maksimal 50 karakter')
    .optional()
    .or(z.literal('')),
  
  tempat_lahir: z.string()
    .trim()
    .max(100, 'Tempat lahir maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
  
  tgl_lahir: z.string()
    .optional()
    .or(z.literal('')),
  
  alumni: z.string()
    .trim()
    .max(255, 'Alumni maksimal 255 karakter')
    .optional()
    .or(z.literal('')),
  
  thn_lulus: z.number()
    .int('Tahun lulus harus bilangan bulat')
    .min(1950, 'Tahun lulus minimal 1950')
    .max(new Date().getFullYear(), 'Tahun lulus tidak boleh di masa depan')
    .optional()
    .nullable(),
  
  tempat_tugas: z.string()
    .trim()
    .max(255, 'Tempat tugas maksimal 255 karakter')
    .optional()
    .or(z.literal('')),
  
  alamat_rumah: z.string()
    .trim()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  
  cabang: z.string()
    .trim()
    .max(100, 'Cabang maksimal 100 karakter')
    .optional()
    .or(z.literal('')),
  
  status: z.string()
    .optional()
    .or(z.literal('')),
  
  kota_kabupaten: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),
  
  provinsi: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),
  
  kota_kabupaten_rumah: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),
  
  provinsi_rumah: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),
  
  kota_kabupaten_kantor: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),
  
  provinsi_kantor: z.string()
    .max(100)
    .optional()
    .or(z.literal('')),
  
  foto: z.string()
    .max(500)
    .optional()
    .or(z.literal('')),
  
  keterangan: z.string()
    .max(1000)
    .optional()
    .or(z.literal('')),
});

export type MemberFormData = z.infer<typeof memberSchema>;

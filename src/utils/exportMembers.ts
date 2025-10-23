import * as XLSX from 'xlsx'
import { Member } from '@/types/member'

interface ExportOptions {
  format: 'xlsx' | 'csv'
  filename?: string
}

export function exportMembersToExcel(members: Member[], options: ExportOptions = { format: 'xlsx' }) {
  // Prepare data with only required fields for sebaran page export
  const exportData = members.map((member, index) => ({
    'No': index + 1,
    'NPA': member.npa || '',
    'Nama Lengkap': `${member.gelar || ''} ${member.nama} ${member.gelar2 || ''}`.trim(),
    'Cabang': member.cabang || '',
    'Tempat Tugas': member.tempat_tugas || '',
    'Kabupaten': member.kota_kabupaten_kantor || '',
    'Provinsi': member.provinsi_kantor || '',
    'Tempat Praktik 1': member.tempat_praktek_1 || '',
    'Tipe RS 1 (Praktik 1)': member.tempat_praktek_1_tipe || '',
    'Tipe RS 2 (Praktik 1)': member.tempat_praktek_1_tipe_2 || '',
    'Tempat Praktik 2': member.tempat_praktek_2 || '',
    'Tipe RS 1 (Praktik 2)': member.tempat_praktek_2_tipe || '',
    'Tipe RS 2 (Praktik 2)': member.tempat_praktek_2_tipe_2 || '',
    'Tempat Praktik 3': member.tempat_praktek_3 || '',
    'Tipe RS 1 (Praktik 3)': member.tempat_praktek_3_tipe || '',
    'Tipe RS 2 (Praktik 3)': member.tempat_praktek_3_tipe_2 || '',
  }))

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // Set column widths
  const columnWidths = [
    { wch: 5 },   // No
    { wch: 12 },  // NPA
    { wch: 35 },  // Nama Lengkap
    { wch: 25 },  // Cabang
    { wch: 30 },  // Tempat Tugas
    { wch: 25 },  // Kabupaten
    { wch: 20 },  // Provinsi
    { wch: 30 },  // Tempat Praktik 1
    { wch: 18 },  // Tipe RS 1 (Praktik 1)
    { wch: 18 },  // Tipe RS 2 (Praktik 1)
    { wch: 30 },  // Tempat Praktik 2
    { wch: 18 },  // Tipe RS 1 (Praktik 2)
    { wch: 18 },  // Tipe RS 2 (Praktik 2)
    { wch: 30 },  // Tempat Praktik 3
    { wch: 18 },  // Tipe RS 1 (Praktik 3)
    { wch: 18 },  // Tipe RS 2 (Praktik 3)
  ]
  worksheet['!cols'] = columnWidths

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Anggota PDPI')

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10)
  const defaultFilename = `Data_Anggota_PDPI_${timestamp}`
  const filename = options.filename || defaultFilename

  // Export based on format
  if (options.format === 'csv') {
    XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' })
  } else {
    XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx' })
  }
}

export function getExportFilename(filters?: any): string {
  const timestamp = new Date().toISOString().slice(0, 10)
  const parts = ['Data_Anggota_PDPI']
  
  if (filters?.provinsi) {
    parts.push(filters.provinsi.replace(/\s+/g, '_'))
  }
  if (filters?.pd) {
    parts.push(filters.pd.replace(/\s+/g, '_'))
  }
  if (filters?.kota) {
    parts.push(filters.kota.replace(/\s+/g, '_'))
  }
  
  parts.push(timestamp)
  
  return parts.join('_')
}

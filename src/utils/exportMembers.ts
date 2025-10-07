import * as XLSX from 'xlsx'
import { Member } from '@/types/member'

interface ExportOptions {
  format: 'xlsx' | 'csv'
  filename?: string
}

export function exportMembersToExcel(members: Member[], options: ExportOptions = { format: 'xlsx' }) {
  // Prepare data with complete biodata
  const exportData = members.map((member, index) => ({
    'No': index + 1,
    'NPA': member.npa || '-',
    'Nama Lengkap': `${member.gelar || ''} ${member.nama} ${member.gelar2 || ''}`.trim(),
    'Jenis Kelamin': member.jenis_kelamin === 'L' ? 'Laki-laki' : member.jenis_kelamin === 'P' ? 'Perempuan' : '-',
    'Tempat Lahir': member.tempat_lahir || '-',
    'Tanggal Lahir': member.tgl_lahir || '-',
    'Alumni': member.alumni || '-',
    'Tahun Lulus': member.thn_lulus || '-',
    'Status': member.status || '-',
    'Cabang/PD': member.cabang || '-',
    
    // Office/Work Location
    'Tempat Tugas': member.tempat_tugas || '-',
    'Kota/Kabupaten Kantor': member.kota_kabupaten_kantor || '-',
    'Provinsi Kantor': member.provinsi_kantor || '-',
    
    // Home Address
    'Alamat Rumah': member.alamat_rumah || '-',
    'Kota/Kabupaten Rumah': member.kota_kabupaten_rumah || '-',
    'Provinsi Rumah': member.provinsi_rumah || '-',
    
    // Practice Locations
    'Tempat Praktik 1': member.tempat_praktek_1 || '-',
    'Tipe RS Praktik 1': member.tempat_praktek_1_tipe || '-',
    'Tempat Praktik 2': member.tempat_praktek_2 || '-',
    'Tipe RS Praktik 2': member.tempat_praktek_2_tipe || '-',
    'Tempat Praktik 3': member.tempat_praktek_3 || '-',
    'Tipe RS Praktik 3': member.tempat_praktek_3_tipe || '-',
    
    // Contact Information
    'Email': member.email || '-',
    'No. HP': member.no_hp || '-',
    
    // Additional Information
    'Keterangan': member.keterangan || '-',
    'Tanggal Dibuat': member.created_at ? new Date(member.created_at).toLocaleDateString('id-ID') : '-',
    'Terakhir Diperbarui': member.updated_at ? new Date(member.updated_at).toLocaleDateString('id-ID') : '-',
  }))

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // Set column widths
  const columnWidths = [
    { wch: 5 },   // No
    { wch: 12 },  // NPA
    { wch: 35 },  // Nama Lengkap
    { wch: 12 },  // Jenis Kelamin
    { wch: 20 },  // Tempat Lahir
    { wch: 15 },  // Tanggal Lahir
    { wch: 25 },  // Alumni
    { wch: 12 },  // Tahun Lulus
    { wch: 12 },  // Status
    { wch: 20 },  // Cabang/PD
    { wch: 30 },  // Tempat Tugas
    { wch: 25 },  // Kota/Kabupaten Kantor
    { wch: 20 },  // Provinsi Kantor
    { wch: 40 },  // Alamat Rumah
    { wch: 25 },  // Kota/Kabupaten Rumah
    { wch: 20 },  // Provinsi Rumah
    { wch: 30 },  // Tempat Praktik 1
    { wch: 15 },  // Tipe RS Praktik 1
    { wch: 30 },  // Tempat Praktik 2
    { wch: 15 },  // Tipe RS Praktik 2
    { wch: 30 },  // Tempat Praktik 3
    { wch: 15 },  // Tipe RS Praktik 3
    { wch: 30 },  // Email
    { wch: 15 },  // No. HP
    { wch: 30 },  // Keterangan
    { wch: 18 },  // Tanggal Dibuat
    { wch: 20 },  // Terakhir Diperbarui
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

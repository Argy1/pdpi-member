import { supabase } from '@/integrations/supabase/client'

// Import function for the parsed Excel data
export const importParsedExcelData = async () => {
  // Sample data from the Excel file - you can expand this with all members
  const sampleMembers = [
    {
      cabang: "12-Bogor",
      status: "Biasa", 
      npa: "11",
      nama: "Boedi Sadjarwa",
      jenis_kelamin: "L",
      gelar: "Dr.",
      gelar2: "Sp.P",
      tempat_lahir: "Kedu",
      tgl_lahir: "1942-07-13",
      alumni: "UI",
      thn_lulus: 1973,
      tempat_tugas: "Praktik Pribadi / RS Swasta",
      kota_kabupaten: "Kota Bogor",
      provinsi: "Jawa Barat",
      alamat_rumah: "Komp. RS Paru Dr. M. Goenawan Partowidigdo Cisarua",
      kota_kabupaten_rumah: "Kota Bogor",
      provinsi_rumah: "Jawa Barat",
      no_hp: "0816-1627923",
      email: "boedisadjarwa@gmail.com",
      foto: "Sudah",
      keterangan: null
    },
    {
      cabang: "14-Jakarta",
      status: "Biasa",
      npa: "14", 
      nama: "Wibowo Suryatenggara",
      jenis_kelamin: "L",
      gelar: "Dr.",
      gelar2: "Sp.P(K)",
      tempat_lahir: "Tangerang",
      tgl_lahir: "1942-11-12",
      alumni: "UI",
      thn_lulus: 1971,
      tempat_tugas: "Praktik Pribadi / RS Swasta",
      kota_kabupaten: "Jakarta Timur",
      provinsi: "DKI Jakarta",
      alamat_rumah: "Jl. Sirap No. 3 Kampung Ambon",
      kota_kabupaten_rumah: "Jakarta Timur",
      provinsi_rumah: "DKI Jakarta",
      no_hp: "0816-999715",
      email: null,
      foto: "Sudah",
      keterangan: null
    }
  ]

  try {
    const { data, error } = await supabase
      .from('members')
      .insert(sampleMembers)
      .select()

    if (error) {
      console.error('Error importing members:', error)
      throw error
    }

    console.log('Successfully imported members:', data)
    return data
  } catch (error) {
    console.error('Error importing members:', error)
    throw error
  }
}
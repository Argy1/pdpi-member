// Province name normalization and lookup utilities

const PROVINCE_ALIASES: Record<string, string> = {
  // Jakarta variants
  'jakarta': 'DKI Jakarta',
  'dki': 'DKI Jakarta',
  'dki jakarta': 'DKI Jakarta',
  'jakarta raya': 'DKI Jakarta',
  
  // Yogyakarta variants
  'yogyakarta': 'DI Yogyakarta',
  'diy': 'DI Yogyakarta',
  'di yogyakarta': 'DI Yogyakarta',
  'jogja': 'DI Yogyakarta',
  'jogjakarta': 'DI Yogyakarta',
  
  // Kepulauan Riau
  'kepri': 'Kepulauan Riau',
  'kep. riau': 'Kepulauan Riau',
  'kep riau': 'Kepulauan Riau',
  'kepulauan riau': 'Kepulauan Riau',
  
  // Bangka Belitung
  'babel': 'Bangka Belitung',
  'bangka belitung': 'Bangka Belitung',
  'kep. bangka belitung': 'Bangka Belitung',
  'kepulauan bangka belitung': 'Bangka Belitung',
  
  // Papua variants - CRITICAL: Handle all Papua provinces with all variations
  'papua barat daya': 'Papua Barat Daya',
  'pabar daya': 'Papua Barat Daya',
  'pbd': 'Papua Barat Daya',
  'papua baratdaya': 'Papua Barat Daya',
  'papuabaratdaya': 'Papua Barat Daya',
  
  'papua pegunungan': 'Papua Pegunungan',
  'papua peg': 'Papua Pegunungan',
  'ppeg': 'Papua Pegunungan',
  'papuapegunungan': 'Papua Pegunungan',
  
  'papua tengah': 'Papua Tengah',
  'papua teng': 'Papua Tengah',
  'pteng': 'Papua Tengah',
  'papuatengah': 'Papua Tengah',
  
  'papua selatan': 'Papua Selatan',
  'papua sel': 'Papua Selatan',
  'psel': 'Papua Selatan',
  'papuaselatan': 'Papua Selatan',
  
  'papua barat': 'Papua Barat',
  'papbar': 'Papua Barat',
  'pap barat': 'Papua Barat',
  
  'papua': 'Papua',
  'irian jaya': 'Papua',
  
  // Other common variants
  'aceh': 'Aceh',
  'sumatera utara': 'Sumatera Utara',
  'sumut': 'Sumatera Utara',
  'sumatera barat': 'Sumatera Barat',
  'sumbar': 'Sumatera Barat',
  'sumatera selatan': 'Sumatera Selatan',
  'sumsel': 'Sumatera Selatan',
  'riau': 'Riau',
  'jambi': 'Jambi',
  'bengkulu': 'Bengkulu',
  'lampung': 'Lampung',
  'banten': 'Banten',
  'jawa barat': 'Jawa Barat',
  'jabar': 'Jawa Barat',
  'jawa tengah': 'Jawa Tengah',
  'jateng': 'Jawa Tengah',
  'jawa timur': 'Jawa Timur',
  'jatim': 'Jawa Timur',
  'bali': 'Bali',
  'nusa tenggara barat': 'Nusa Tenggara Barat',
  'ntb': 'Nusa Tenggara Barat',
  'nusa tenggara timur': 'Nusa Tenggara Timur',
  'ntt': 'Nusa Tenggara Timur',
  'kalimantan barat': 'Kalimantan Barat',
  'kalbar': 'Kalimantan Barat',
  'kalimantan tengah': 'Kalimantan Tengah',
  'kalteng': 'Kalimantan Tengah',
  'kalimantan selatan': 'Kalimantan Selatan',
  'kalsel': 'Kalimantan Selatan',
  'kalimantan timur': 'Kalimantan Timur',
  'kaltim': 'Kalimantan Timur',
  'kalimantan utara': 'Kalimantan Utara',
  'kaltara': 'Kalimantan Utara',
  'sulawesi utara': 'Sulawesi Utara',
  'sulut': 'Sulawesi Utara',
  'sulawesi tengah': 'Sulawesi Tengah',
  'sulteng': 'Sulawesi Tengah',
  'sulawesi selatan': 'Sulawesi Selatan',
  'sulsel': 'Sulawesi Selatan',
  'sulawesi tenggara': 'Sulawesi Tenggara',
  'sultra': 'Sulawesi Tenggara',
  'gorontalo': 'Gorontalo',
  'sulawesi barat': 'Sulawesi Barat',
  'sulbar': 'Sulawesi Barat',
  'maluku': 'Maluku',
  'maluku utara': 'Maluku Utara',
  'malut': 'Maluku Utara'
}

let cityToProvinceMap: Record<string, string> | null = null

async function loadCityToProvinceMap(): Promise<Record<string, string>> {
  if (cityToProvinceMap) return cityToProvinceMap
  
  try {
    const response = await fetch('/geo/kabkota-to-provinsi.json', { cache: 'no-store' })
    cityToProvinceMap = await response.json()
    return cityToProvinceMap
  } catch (error) {
    console.error('Failed to load city-to-province map:', error)
    return {}
  }
}

/**
 * Normalize province name to canonical form
 * @param provinsi Raw province name from database
 * @returns Normalized province name
 */
export function normalizeProvinsi(provinsi: string | null | undefined): string {
  if (!provinsi) return ''
  
  // Remove extra whitespace and convert to lowercase for matching
  const cleaned = provinsi.trim().toLowerCase()
    .replace(/\./g, '') // Remove dots
    .replace(/\s+/g, ' ') // Normalize whitespace
  
  // Check if it matches any alias
  const normalized = PROVINCE_ALIASES[cleaned]
  if (normalized) return normalized
  
  // If no alias found, return title case version
  return provinsi
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Infer province from city name using lookup table
 * @param kota City name
 * @returns Province name or empty string if not found
 */
export async function inferProvFromKota(kota: string | null | undefined): Promise<string> {
  if (!kota) return ''
  
  const map = await loadCityToProvinceMap()
  
  // Try exact match first
  const cleaned = kota.trim()
  if (map[cleaned]) return map[cleaned]
  
  // Try case-insensitive match
  const kotaLower = cleaned.toLowerCase()
  for (const [city, prov] of Object.entries(map)) {
    if (city.toLowerCase() === kotaLower) {
      return prov
    }
  }
  
  // Try partial match (city name contains the key)
  for (const [city, prov] of Object.entries(map)) {
    if (kotaLower.includes(city.toLowerCase()) || city.toLowerCase().includes(kotaLower)) {
      return prov
    }
  }
  
  return ''
}

/**
 * Get final province name - normalize if present, infer from city if not
 * @param provinsi Province name from database
 * @param kota City name from database
 * @returns Final normalized province name
 */
export async function getFinalProvinsi(
  provinsi: string | null | undefined,
  kota: string | null | undefined
): Promise<string> {
  // First try to normalize the province name
  const normalized = normalizeProvinsi(provinsi)
  if (normalized) return normalized
  
  // If no province, try to infer from city
  const inferred = await inferProvFromKota(kota)
  return inferred
}

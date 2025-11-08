/**
 * Get all 39 provinces from centroids data
 * This ensures filter lists show all provinces, not just those with members
 */
export async function getAllProvinces(): Promise<string[]> {
  try {
    const response = await fetch('/geo/centroids-provinces.json', { cache: 'no-store' })
    const centroids = await response.json()
    
    // Get unique province names
    const provinceNames: string[] = centroids
      .map((c: any) => c.provinsi as string)
    
    // Remove duplicates and sort
    const uniqueProvinces = Array.from(new Set<string>(provinceNames))
      .sort((a, b) => a.localeCompare(b, 'id'))
    
    return uniqueProvinces
  } catch (error) {
    console.error('Failed to load provinces from centroids:', error)
    return []
  }
}

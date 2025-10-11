// Search query parser for advanced search functionality

interface ParsedQuery {
  tokens: string[]
  phrases: string[]
  fieldFilters: { field: string; value: string }[]
  isOrQuery: boolean
}

export function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/^(dr\.?|dr\s)/i, '') // Remove "dr" or "dr." prefix
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

export function parseSearchQuery(query: string): ParsedQuery {
  const result: ParsedQuery = {
    tokens: [],
    phrases: [],
    fieldFilters: [],
    isOrQuery: false
  }

  if (!query?.trim()) return result

  let remaining = query.trim()

  // Extract quoted phrases
  const phraseRegex = /"([^"]+)"/g
  let match
  while ((match = phraseRegex.exec(remaining)) !== null) {
    result.phrases.push(normalizeText(match[1]))
    remaining = remaining.replace(match[0], ' ')
  }

  // Extract field:value filters
  const fieldRegex = /(\w+):\s*"?([^"\s]+)"?/g
  while ((match = fieldRegex.exec(remaining)) !== null) {
    const field = match[1].toLowerCase()
    const value = match[2]
    result.fieldFilters.push({ field, value })
    remaining = remaining.replace(match[0], ' ')
  }

  // Check for OR operator
  if (remaining.includes('|')) {
    result.isOrQuery = true
    remaining = remaining.replace(/\|/g, ' ')
  }

  // Extract remaining tokens
  const tokens = remaining
    .split(/\s+/)
    .map(token => normalizeText(token))
    .filter(token => token.length > 0)

  result.tokens = tokens

  return result
}

export function buildSearchConditions(parsedQuery: ParsedQuery, isAdmin: boolean = false) {
  const conditions: string[] = []

  // Handle field-specific filters
  parsedQuery.fieldFilters.forEach(({ field, value }) => {
    switch (field) {
      case 'npa':
        conditions.push(`npa.ilike.%${value}%`)
        break
      case 'kota':
        conditions.push(`kota_kabupaten.ilike.%${value}%`)
        break
      case 'provinsi':
        conditions.push(`provinsi.ilike.%${value}%`)
        break
      case 'pd':
      case 'cabang':
        conditions.push(`cabang.ilike.%${value}%`)
        break
      case 'spesialis':
        conditions.push(`alumni.ilike.%${value}%`)
        break
      case 'rs':
      case 'rumahsakit':
        conditions.push(`tempat_tugas.ilike.%${value}%`)
        break
      // Admin-only fields
      case 'str':
        if (isAdmin) conditions.push(`no_str.ilike.%${value}%`)
        break
      case 'sip':
        if (isAdmin) conditions.push(`no_sip.ilike.%${value}%`)
        break
      case 'nik':
        if (isAdmin) conditions.push(`nik.ilike.%${value}%`)
        break
      case 'email':
        if (isAdmin) conditions.push(`email.ilike.%${value}%`)
        break
      case 'telepon':
      case 'hp':
        if (isAdmin) conditions.push(`no_hp.ilike.%${value}%`)
        break
    }
  })

  // Handle phrases and tokens - build single OR condition for text search
  const searchTerms = [...parsedQuery.phrases, ...parsedQuery.tokens]
  
  if (searchTerms.length > 0) {
    const allSearchConditions: string[] = []
    
    searchTerms.forEach(term => {
      const normalizedTerm = normalizeText(term)
      if (normalizedTerm) {
        const termConditions = []

        // Priority exact matches first
        if (normalizedTerm.match(/^\d+$/)) { // If term is numeric (like NPA)
          termConditions.push(`npa.eq.${normalizedTerm}`)
        }

        // Then partial matches
        termConditions.push(
          `nama.ilike.%${normalizedTerm}%`,
          `tempat_tugas.ilike.%${normalizedTerm}%`,
          `kota_kabupaten.ilike.%${normalizedTerm}%`,
          `provinsi.ilike.%${normalizedTerm}%`,
          `cabang.ilike.%${normalizedTerm}%`
        )

        // Add admin fields if applicable
        if (isAdmin) {
          termConditions.push(
            `email.ilike.%${normalizedTerm}%`,
            `no_hp.ilike.%${normalizedTerm}%`,
            `nik.ilike.%${normalizedTerm}%`,
            `no_str.ilike.%${normalizedTerm}%`,
            `no_sip.ilike.%${normalizedTerm}%`
          )
        }

        // Always include search_text as fallback
        termConditions.push(`search_text.ilike.%${normalizedTerm}%`)

        // Add term conditions with OR
        if (termConditions.length > 0) {
          allSearchConditions.push(`(${termConditions.join(' or ')})`)
        }
      }
    })

    // Combine all term conditions with AND by default, OR if specified
    if (allSearchConditions.length > 0) {
      const operator = parsedQuery.isOrQuery ? ' or ' : ' and '
      conditions.push(allSearchConditions.join(operator))
    }
  }

  return conditions
}

export function highlightMatches(text: string, searchTerms: string[]): string {
  if (!text || searchTerms.length === 0) return text

  let result = text
  searchTerms.forEach(term => {
    const normalizedTerm = normalizeText(term)
    if (normalizedTerm.length > 1) {
      const regex = new RegExp(`(${normalizedTerm})`, 'gi')
      result = result.replace(regex, '<mark>$1</mark>')
    }
  })

  return result
}
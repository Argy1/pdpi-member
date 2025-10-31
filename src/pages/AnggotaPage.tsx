import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { SearchBar } from "@/components/SearchBar"
import { MemberFiltersComponent } from "@/components/MemberFilters"
import { MemberTable } from "@/components/MemberTable"
import { PublicMemberTable } from "@/components/PublicMemberTable"
import { MemberModal } from "@/components/MemberModal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Member, MemberFilters, MemberSort } from "@/types/member"
import { mockProvinces, mockPDs, mockSubspesialisOptions, mockCities } from "@/data/mockMembers"
import { useMembers } from '@/hooks/useMembers'
import { supabase } from "@/integrations/supabase/client"
import { AnggotaAPI } from "@/pages/api/AnggotaAPI"
import { ArrowUpDown, Users, RefreshCw, X } from "lucide-react"

export default function AnggotaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [hospitalTypes, setHospitalTypes] = useState<string[]>([])
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([])
  const [availableBranches, setAvailableBranches] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])

  // Initialize state from URL params
  const [filters, setFilters] = useState<MemberFilters>(() => {
    // Read both 'provinsi' (from map) and 'provinsi_kantor' (from filters)
    const provinsiParam = searchParams.get("provinsi") || searchParams.get("provinsi_kantor")
    
    return {
      query: searchParams.get("q") || undefined,
      provinsi_kantor: provinsiParam ? [provinsiParam] : undefined,
      pd: searchParams.get("pd") ? [searchParams.get("pd")!] : undefined,
      subspesialis: searchParams.get("subspesialis") ? [searchParams.get("subspesialis")!] : undefined,
    }
  })

  const [sort, setSort] = useState<MemberSort>({
    field: "nama",
    direction: "asc"
  })

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "25")
  })

  // Check authentication status and fetch hospital types
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }
    checkAuth()

    const fetchData = async () => {
      try {
        // Import getAllProvinces helper
        const { getAllProvinces } = await import('@/utils/getAllProvinces')
        
        const [hospitalTypesResult, allProvinces, citiesResult] = await Promise.all([
          AnggotaAPI.getHospitalTypes(),
          getAllProvinces(), // Get all 39 provinces from centroids
          AnggotaAPI.getAvailableCities()
        ])
        
        // Fetch branches separately since we don't have a dedicated API method for it yet
        const { data: branchData } = await supabase
          .from('members')
          .select('cabang')
          .not('cabang', 'is', null)
        
        const branches = [...new Set(branchData?.map(m => m.cabang).filter(Boolean))] as string[]
        
        if (hospitalTypesResult.data) {
          setHospitalTypes(hospitalTypesResult.data)
        }
        // Use all provinces from centroids instead of just those with members
        setAvailableProvinces(allProvinces)
        if (citiesResult.data) {
          setAvailableCities(citiesResult.data)
        }
        setAvailableBranches(branches.sort())
      } catch (error) {
        console.error('Error fetching filter data:', error)
      }
    }
    fetchData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Use the new hook for fetching data
  const { 
    members, 
    total, 
    totalPages, 
    loading, 
    error, 
    refresh 
  } = useMembers({
    query: filters.query,
    provinsi_kantor: filters.provinsi_kantor,
    pd: filters.pd?.[0],
    subspesialis: filters.subspesialis?.[0],
    namaHurufDepan: filters.namaHurufDepan,
    hospitalType: filters.hospitalType,
    namaRS: filters.namaRS,
    npa: filters.npa,
    kota_kabupaten_kantor: filters.kota_kabupaten_kantor,
    sort: `${sort.field}_${sort.direction}`,
    limit: pagination.limit,
    page: pagination.page,
    scope: isAuthenticated ? 'admin' : 'public'
  })

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.query) params.set("q", filters.query)
    if (filters.provinsi_kantor?.length) params.set("provinsi_kantor", filters.provinsi_kantor.join(","))
    if (filters.pd?.length) params.set("pd", filters.pd.join(","))
    if (filters.subspesialis?.length) params.set("subspesialis", filters.subspesialis.join(","))
    if (filters.hospitalType?.length) params.set("hospitalType", filters.hospitalType.join(","))
    if (pagination.page > 1) params.set("page", pagination.page.toString())
    if (pagination.limit !== 25) params.set("limit", pagination.limit.toString())
    if (sort.field !== "nama" || sort.direction !== "asc") {
      params.set("sort", `${sort.field}-${sort.direction}`)
    }

    setSearchParams(params)
  }, [filters, pagination, sort, setSearchParams])

  const paginationInfo = {
    page: pagination.page,
    limit: pagination.limit,
    total: total,
    totalPages: totalPages
  }

  const handleFiltersChange = (newFilters: MemberFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split("-") as [keyof Member, "asc" | "desc"]
    setSort({ field, direction })
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }))
  }

  const handleViewMember = (member: Member) => {
    setSelectedMember(member)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedMember(null)
  }

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Memuat...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container-pdpi section-spacing">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold heading-medical">
              {isAuthenticated ? "Manajemen Anggota PDPI" : "Direktori Anggota PDPI"}
            </h1>
            <p className="text-lg text-medical-body">
              {isAuthenticated 
                ? "Kelola data anggota Perhimpunan Dokter Paru Indonesia"
                : "Direktori publik anggota Perhimpunan Dokter Paru Indonesia"
              }
            </p>
          </div>

          {/* Search Bar - Only trigger on Enter or Click */}
          <SearchBar
            value={filters.query || ''}
            onSearch={(query) => {
              setFilters(prev => ({ ...prev, query }))
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            placeholder="Cari nama anggota..."
            size="default"
            scope={isAuthenticated ? 'admin' : 'public'}
          />
          
          {/* Search Chip - Show active search query */}
          {filters.query && (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                <span className="font-medium">Nama: {filters.query}</span>
                <button
                  onClick={() => {
                    setFilters(prev => ({ ...prev, query: undefined }))
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="hover:bg-background rounded-full p-1 transition-colors"
                  aria-label="Hapus pencarian"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filters - Show for all users */}
        <div className="space-y-4 mb-6">
          {/* Filters */}
          <MemberFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            provinces={availableProvinces}
            pds={availableBranches}
            cities={availableCities}
            hospitalTypes={hospitalTypes}
            isPublicView={!isAuthenticated}
          />

          {/* Results Info and Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {loading ? 'Memuat...' : `${total} anggota ditemukan`}
                </span>
              </div>
              {error && (
                <div className="text-sm text-red-600">
                  Error: {error}
                </div>
              )}
            </div>

            {/* Sort and Refresh - Only show for authenticated users */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refresh}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={`${sort.field}-${sort.direction}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-48 focus-visible">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nama-asc">Nama A-Z</SelectItem>
                    <SelectItem value="nama-desc">Nama Z-A</SelectItem>
                    <SelectItem value="kota-asc">Kota A-Z</SelectItem>
                    <SelectItem value="provinsi-asc">Provinsi A-Z</SelectItem>
                    <SelectItem value="tahunLulus-desc">Tahun Lulus Terbaru</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Memuat data anggota...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              Gagal memuat data: {error}
            </div>
            <Button onClick={refresh} variant="outline">
              Coba Lagi
            </Button>
          </div>
        ) : isAuthenticated ? (
          <MemberTable
            members={members}
            onViewMember={handleViewMember}
            pagination={paginationInfo}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        ) : (
          <PublicMemberTable
            members={members}
            pagination={paginationInfo}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}

        {/* Member Detail Modal - Only show for authenticated users */}
        {isAuthenticated && (
          <MemberModal
            member={selectedMember}
            open={modalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  )
}
import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { SearchBar } from "@/components/SearchBar"
import { MemberFiltersComponent } from "@/components/MemberFilters"
import { MemberTable } from "@/components/MemberTable"
import { MemberModal } from "@/components/MemberModal"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Member, MemberFilters, MemberSort } from "@/types/member"
import { mockMembers, mockProvinces, mockPDs, mockSubspesialisOptions } from "@/data/mockMembers"
import { ArrowUpDown, Users } from "lucide-react"

export default function AnggotaPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Initialize state from URL params
  const [filters, setFilters] = useState<MemberFilters>(() => ({
    query: searchParams.get("q") || undefined,
    provinsi: searchParams.get("provinsi") ? [searchParams.get("provinsi")!] : undefined,
    pd: searchParams.get("pd") ? [searchParams.get("pd")!] : undefined,
    subspesialis: searchParams.get("subspesialis") ? [searchParams.get("subspesialis")!] : undefined,
  }))

  const [sort, setSort] = useState<MemberSort>({
    field: "nama",
    direction: "asc"
  })

  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "25")
  })

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filters.query) params.set("q", filters.query)
    if (filters.provinsi?.length) params.set("provinsi", filters.provinsi.join(","))
    if (filters.pd?.length) params.set("pd", filters.pd.join(","))
    if (filters.subspesialis?.length) params.set("subspesialis", filters.subspesialis.join(","))
    if (pagination.page > 1) params.set("page", pagination.page.toString())
    if (pagination.limit !== 25) params.set("limit", pagination.limit.toString())
    if (sort.field !== "nama" || sort.direction !== "asc") {
      params.set("sort", `${sort.field}-${sort.direction}`)
    }

    setSearchParams(params)
  }, [filters, pagination, sort, setSearchParams])

  // Filter and sort logic
  const filteredAndSortedMembers = useMemo(() => {
    let result = [...mockMembers]

    // Apply filters
    if (filters.query) {
      const query = filters.query.toLowerCase()
      result = result.filter(member => 
        member.nama.toLowerCase().includes(query) ||
        member.gelar?.toLowerCase().includes(query) ||
        member.npa?.toLowerCase().includes(query) ||
        member.spesialis?.toLowerCase().includes(query) ||
        member.subspesialis?.toLowerCase().includes(query) ||
        member.tempatLahir?.toLowerCase().includes(query) ||
        member.tanggalLahir?.toLowerCase().includes(query) ||
        member.jenisKelamin?.toLowerCase().includes(query) ||
        member.alamat?.toLowerCase().includes(query) ||
        member.kota?.toLowerCase().includes(query) ||
        member.provinsi?.toLowerCase().includes(query) ||
        member.pd?.toLowerCase().includes(query) ||
        member.rumahSakit?.toLowerCase().includes(query) ||
        member.unitKerja?.toLowerCase().includes(query) ||
        member.jabatan?.toLowerCase().includes(query) ||
        member.nik?.toLowerCase().includes(query) ||
        member.noSTR?.toLowerCase().includes(query) ||
        member.strBerlakuSampai?.toLowerCase().includes(query) ||
        member.noSIP?.toLowerCase().includes(query) ||
        member.sipBerlakuSampai?.toLowerCase().includes(query) ||
        member.tahunLulus?.toString().includes(query) ||
        member.status?.toLowerCase().includes(query) ||
        member.kontakEmail?.toLowerCase().includes(query) ||
        member.kontakTelepon?.toLowerCase().includes(query) ||
        member.website?.toLowerCase().includes(query) ||
        member.sosialMedia?.toLowerCase().includes(query)
      )
    }

    if (filters.provinsi?.length) {
      result = result.filter(member => 
        member.provinsi && filters.provinsi!.includes(member.provinsi)
      )
    }

    if (filters.pd?.length) {
      result = result.filter(member => 
        member.pd && filters.pd!.includes(member.pd)
      )
    }

    if (filters.subspesialis?.length) {
      result = result.filter(member => 
        member.subspesialis && filters.subspesialis!.includes(member.subspesialis)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sort.field] || ""
      const bValue = b[sort.field] || ""
      
      let comparison = 0
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue, "id")
      } else {
        comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
      
      return sort.direction === "asc" ? comparison : -comparison
    })

    return result
  }, [filters, sort])

  // Pagination logic
  const paginatedMembers = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit
    return filteredAndSortedMembers.slice(startIndex, startIndex + pagination.limit)
  }, [filteredAndSortedMembers, pagination])

  const paginationInfo = {
    page: pagination.page,
    limit: pagination.limit,
    total: filteredAndSortedMembers.length,
    totalPages: Math.ceil(filteredAndSortedMembers.length / pagination.limit)
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

  return (
    <div className="min-h-screen">
      <div className="container-pdpi section-spacing">
        {/* Header */}
        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold heading-medical">
              Tabel Anggota PDPI
            </h1>
            <p className="text-lg text-medical-body">
              Direktori lengkap anggota Perhimpunan Dokter Paru Indonesia
            </p>
          </div>

          {/* Search Bar */}
          <SearchBar 
            placeholder="Cari semua data anggota (nama, NPA, alamat, telepon, dll)..."
            className="max-w-xl"
          />
        </div>

        {/* Toolbar */}
        <div className="space-y-4 mb-6">
          {/* Filters */}
          <MemberFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            provinces={mockProvinces}
            pds={mockPDs}
            subspecialties={mockSubspesialisOptions}
          />

          {/* Sort and Results Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {filteredAndSortedMembers.length} anggota ditemukan
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
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
          </div>
        </div>

        {/* Table */}
        <MemberTable
          members={paginatedMembers}
          onViewMember={handleViewMember}
          pagination={paginationInfo}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />

        {/* Member Detail Modal */}
        <MemberModal
          member={selectedMember}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  )
}
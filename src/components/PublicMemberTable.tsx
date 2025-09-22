import { Member } from "@/types/member"
import { PublicMemberCard } from "./PublicMemberCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PublicMemberTableProps {
  members: Member[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function PublicMemberTable({ 
  members, 
  pagination, 
  onPageChange, 
  onLimitChange 
}: PublicMemberTableProps) {
  const { page, limit, total, totalPages } = pagination

  const startIndex = (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, total)

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tidak ada anggota yang ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Member Cards Grid */}
      <div className="grid gap-4">
        {members.map((member) => (
          <PublicMemberCard key={member.id} member={member} />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="border-t pt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Items per page */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Tampilkan</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm font-medium">per halaman</span>
          </div>

          {/* Results info */}
          <div className="text-sm text-muted-foreground">
            Menampilkan {startIndex}-{endIndex} dari {total} anggota
          </div>

          {/* Page navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
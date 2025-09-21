import { useState } from "react"
import { Member } from "@/types/member"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"

interface MemberTableProps {
  members: Member[]
  onViewMember: (member: Member) => void
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

export function MemberTable({ 
  members, 
  onViewMember, 
  pagination,
  onPageChange,
  onLimitChange 
}: MemberTableProps) {
  const { page, limit, total, totalPages } = pagination

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "Biasa":
        return <Badge className="bg-success/10 text-success border-success/20">Biasa</Badge>
      case "Luar Biasa":
        return <Badge className="bg-primary/10 text-primary border-primary/20">Luar Biasa</Badge>
      case "Meninggal":
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Meninggal</Badge>
      case "Muda":
        return <Badge className="bg-warning/10 text-warning border-warning/20">Muda</Badge>
      default:
        return <Badge variant="outline">-</Badge>
    }
  }

  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-semibold">Nama</TableHead>
                <TableHead className="font-semibold">NPA</TableHead>
                <TableHead className="font-semibold">Alumni</TableHead>
                <TableHead className="font-semibold">Rumah Sakit</TableHead>
                <TableHead className="font-semibold">Kota</TableHead>
                <TableHead className="font-semibold">Provinsi</TableHead>
                <TableHead className="font-semibold">Cabang/Wilayah</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow 
                  key={member.id}
                  className="hover:bg-muted/30 transition-smooth cursor-pointer"
                  onClick={() => onViewMember(member)}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{member.nama}</p>
                      {member.subspesialis && (
                        <p className="text-xs text-muted-foreground">
                          {member.subspesialis}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {member.npa || "-"}
                    </code>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{member.alumni || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">{member.rumahSakit || "-"}</p>
                      {member.unitKerja && (
                        <p className="text-xs text-muted-foreground">
                          {member.unitKerja}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{member.kota || "-"}</TableCell>
                  <TableCell>{member.provinsi || "-"}</TableCell>
                  <TableCell>{member.pd || "-"}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewMember(member)
                      }}
                      className="focus-visible"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">Tidak ada data anggota</p>
                      <p className="text-sm text-muted-foreground">
                        Coba ubah filter atau kata kunci pencarian
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Menampilkan {startItem}–{endItem} dari {total} anggota
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value={25}>25 per halaman</option>
            <option value={50}>50 per halaman</option>
            <option value={100}>100 per halaman</option>
          </select>

          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="focus-visible"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

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
                    className="w-9 h-9 focus-visible"
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
              className="focus-visible"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
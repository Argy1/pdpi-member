import { Download, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Ebook } from '@/hooks/useEbooks';

interface EbookDetailModalProps {
  ebook: Ebook | null;
  open: boolean;
  onClose: () => void;
  onDownload: (ebook: Ebook) => void;
}

export const EbookDetailModal = ({
  ebook,
  open,
  onClose,
  onDownload,
}: EbookDetailModalProps) => {
  if (!ebook) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Detail E-book</DialogTitle>
          <DialogDescription className="sr-only">
            Informasi lengkap tentang e-book
          </DialogDescription>
        </DialogHeader>

        {/* Cover */}
        <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center -mt-4">
          {ebook.coverUrl ? (
            <img
              src={ebook.coverUrl}
              alt={ebook.title}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <BookOpen className="h-32 w-32 text-primary/40" strokeWidth={1.5} />
          )}
        </div>

        <div className="space-y-6 pt-4">
          {/* Title & Subtitle */}
          <div>
            <h2 className="text-2xl md:text-3xl font-bold heading-medical mb-2">
              {ebook.title}
            </h2>
            {ebook.subtitle && (
              <p className="text-lg text-muted-foreground">{ebook.subtitle}</p>
            )}
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Penulis</p>
              <p className="font-medium">{ebook.authors}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Tahun</p>
              <p className="font-medium">{ebook.year}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Versi</p>
              <p className="font-medium">{ebook.version}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Bahasa</p>
              <p className="font-medium">
                {ebook.language === 'ID' ? 'Indonesia' : 'English'}
              </p>
            </div>
          </div>

          {/* Category & Tags */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Kategori & Tag</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{ebook.category}</Badge>
              {ebook.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Deskripsi</p>
            <p className="text-foreground/90 leading-relaxed">{ebook.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {ebook.downloadCount} unduhan
            </span>
            <span>Ukuran: {ebook.fileSizeMB} MB</span>
          </div>

          {/* Citation */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Sitasi</p>
            <p className="text-sm font-mono">
              PDPI. {ebook.title}. {ebook.year}.
            </p>
          </div>

          {/* Download Button */}
          <Button
            onClick={() => onDownload(ebook)}
            className="w-full h-12 text-base"
            size="lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

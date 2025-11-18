import { Download, Eye, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Ebook } from '@/pages/BankDataPage';

interface EbookCardProps {
  ebook: Ebook;
  onDetailClick: () => void;
  onDownloadClick: () => void;
}

export const EbookCard = ({ ebook, onDetailClick, onDownloadClick }: EbookCardProps) => {
  return (
    <Card className="group hover:-translate-y-1 hover:shadow-xl hover:border-primary/50 transition-all duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center border-b">
        {ebook.coverUrl ? (
          <img
            src={ebook.coverUrl}
            alt={ebook.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <BookOpen className="h-20 w-20 text-primary/40" strokeWidth={1.5} />
        )}
      </div>

      <CardContent className="p-5 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg heading-medical line-clamp-2 min-h-[3.5rem]">
          {ebook.title}
        </h3>

        {/* Meta Info */}
        <p className="text-sm text-muted-foreground">
          {ebook.category} • {ebook.tags[0]} • {ebook.year}
        </p>

        {/* Authors */}
        <p className="text-sm text-foreground/70">Oleh: {ebook.authors}</p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {ebook.language === 'ID' ? 'Indonesia' : 'English'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {ebook.version}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 flex flex-col gap-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {ebook.downloadCount} unduhan
          </span>
          <span>{ebook.fileSizeMB} MB</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onDetailClick}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-1" />
            Detail
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onDownloadClick}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

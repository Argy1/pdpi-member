import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, CheckCircle2 } from 'lucide-react';

interface FacilityViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalName: string;
  hospitalType: string;
  facilities: string[];
  facilityType?: 'type1' | 'type2';
}

export function FacilityViewDialog({ 
  open, 
  onOpenChange, 
  hospitalName, 
  hospitalType, 
  facilities,
  facilityType = 'type1'
}: FacilityViewDialogProps) {
  const title = facilityType === 'type1' ? 'Fasilitas Kesehatan 1' : 'Fasilitas Kesehatan 2';
  const typeLabel = facilityType === 'type1' ? 'Tipe RS 1' : 'Tipe RS 2';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Detail fasilitas yang tersedia
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nama Rumah Sakit/Tempat Praktek</label>
              <p className="text-base font-semibold mt-1">{hospitalName}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">{typeLabel}</label>
              <div className="mt-1">
                <Badge variant="outline" className="text-sm">
                  {hospitalType}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Fasilitas yang Tersedia ({facilities.length})
            </label>
            
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {facilities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Belum ada fasilitas yang ditambahkan
                </p>
              ) : (
                <div className="space-y-2">
                  {facilities.map((facility, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{facility}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

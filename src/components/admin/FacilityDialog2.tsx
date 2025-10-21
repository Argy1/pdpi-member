import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FacilityDialog2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFacilities: string;
  onSave: (facilities: string) => void;
}

// Semua fasilitas tanpa filter tipe
const ALL_FACILITIES = [
  'USG',
  'X-Ray',
  'Set Minor',
  'Set Bedah Plastik',
  'Set Biopsi Gun',
  'Set Operasi Mayor',
  'Set Alat VTP',
  'Ventilator',
  'CT Scan',
  'CT Angiography',
  'C-Arm',
  'Mesin ESWL (Extracorporeal Shock Wave Lithotripsy)',
  'USG Doppler',
  'Mesin HD',
  'Micro Set',
  'Set Endourologi',
  'Set laparotomi',
  'Lithotriptor',
  'Surgical Loupe',
  'MRI',
  'Flexible Ureteroscopy',
  'Set Fluoroscopy',
  'Laser',
  'Monitor invasif dan noninvasive',
  'Set Laparoskopi',
  'Set Sitoskopi Fleksibel',
  'Set vaskular',
  'Set endourologi anak',
  'Surgical Microscope',
  'Peritoneoskop',
  'Vascular Synthetic Graft',
  'Mesin CRRT (Continuous Renal Replacement Therapy)',
  'Mesin APD (Automated Peritoneal Dialysis)',
  'Neurostimulator',
  'Set Transplantasi Ginjal',
  'Set Urodinamik',
  'Alat radioterapi',
  'Bone Scan',
  'Mesin ESWT (Extracorporeal Shock Wave Therapy)',
];

export function FacilityDialog2({ open, onOpenChange, selectedFacilities, onSave }: FacilityDialog2Props) {
  const [facilities, setFacilities] = useState<string[]>([]);

  useEffect(() => {
    // Parse selected facilities from comma-separated string
    if (selectedFacilities) {
      setFacilities(selectedFacilities.split(',').map(f => f.trim()).filter(Boolean));
    } else {
      setFacilities([]);
    }
  }, [selectedFacilities]);

  const handleToggleFacility = (facility: string) => {
    setFacilities(prev => {
      if (prev.includes(facility)) {
        return prev.filter(f => f !== facility);
      }
      return [...prev, facility];
    });
  };

  const handleSave = () => {
    // Convert array to comma-separated string
    onSave(facilities.join(', '));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Fasilitas Kesehatan 2</DialogTitle>
          <DialogDescription>
            Pilih fasilitas kesehatan yang tersedia
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {ALL_FACILITIES.map((facility) => (
              <div key={facility} className="flex items-center space-x-2">
                <Checkbox
                  id={`fac2-${facility}`}
                  checked={facilities.includes(facility)}
                  onCheckedChange={() => handleToggleFacility(facility)}
                />
                <Label
                  htmlFor={`fac2-${facility}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {facility}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" onClick={handleSave}>
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

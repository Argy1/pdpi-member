import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FacilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalType: string;
  selectedFacilities: string[];
  onSave: (facilities: string[]) => void;
}

// All facilities in one list as requested
const ALL_FACILITIES = [
  // Dasar
  'USG',
  'X-Ray',
  'Set Minor',
  'Set Bedah Plastik',
  'Set Biopsi Gun',
  'Set Operasi Mayor',
  'Set Alat VTP',
  'Ventilator',
  // Madya (ditambah)
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
  // Utama (ditambah)
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
  // Paripurna (ditambah)
  'Mesin CRRT (Continuous Renal Replacement Therapy)',
  'Mesin APD (Automated Peritoneal Dialysis)',
  'Neurostimulator',
  'Set Transplantasi Ginjal',
  'Set Urodinamik',
  'Alat radioterapi',
  'Bone Scan',
  'Mesin ESWT (Extracorporeal Shock Wave Therapy)',
];

export function FacilityDialog({ open, onOpenChange, hospitalType, selectedFacilities, onSave }: FacilityDialogProps) {
  const [facilities, setFacilities] = useState<string[]>(selectedFacilities);
  const [customFacility, setCustomFacility] = useState('');

  useEffect(() => {
    setFacilities(selectedFacilities);
  }, [selectedFacilities]);

  // Always show all facilities for all types
  const availableFacilities = ALL_FACILITIES;

  const handleToggleFacility = (facility: string) => {
    setFacilities(prev => {
      if (prev.includes(facility)) {
        return prev.filter(f => f !== facility);
      }
      return [...prev, facility];
    });
  };

  const handleAddCustomFacility = () => {
    if (customFacility.trim() && !facilities.includes(customFacility.trim())) {
      setFacilities(prev => [...prev, customFacility.trim()]);
      setCustomFacility('');
    }
  };

  const handleRemoveCustomFacility = (facility: string) => {
    setFacilities(prev => prev.filter(f => f !== facility));
  };

  const handleSave = () => {
    onSave(facilities);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Pilih Fasilitas Kesehatan</DialogTitle>
          <DialogDescription>
            Pilih fasilitas kesehatan yang tersedia
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {availableFacilities.map((facility) => (
              <div key={facility} className="flex items-center space-x-2">
                <Checkbox
                  id={facility}
                  checked={facilities.includes(facility)}
                  onCheckedChange={() => handleToggleFacility(facility)}
                />
                <Label
                  htmlFor={facility}
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

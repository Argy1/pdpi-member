import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FacilityDialog1Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalType: string;
  selectedFacilities: string;
  onSave: (facilities: string) => void;
}

// Fasilitas berdasarkan tipe RS 1
const FACILITIES_BY_TYPE = {
  'Dasar': [
    'USG',
    'X-Ray',
    'Set Minor',
    'Set Bedah Plastik',
    'Set Biopsi Gun',
    'Set Operasi Mayor',
    'Set Alat VTP',
    'Ventilator',
  ],
  'Madya': [
    // Peralatan Kesehatan di Dasar
    'USG',
    'X-Ray',
    'Set Minor',
    'Set Bedah Plastik',
    'Set Biopsi Gun',
    'Set Operasi Mayor',
    'Set Alat VTP',
    'Ventilator',
    // ditambah:
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
  ],
  'Utama': [
    // Peralatan Kesehatan di Madya
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
    // ditambah:
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
  ],
  'Paripurna': [
    // Peralatan Kesehatan di Utama
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
    // ditambah:
    'Mesin CRRT (Continuous Renal Replacement Therapy)',
    'Mesin APD (Automated Peritoneal Dialysis)',
    'Neurostimulator',
    'Set Transplantasi Ginjal',
    'Set Urodinamik',
    'Alat radioterapi',
    'Bone Scan',
    'Mesin ESWT (Extracorporeal Shock Wave Therapy)',
  ],
};

export function FacilityDialog1({ open, onOpenChange, hospitalType, selectedFacilities, onSave }: FacilityDialog1Props) {
  const [facilities, setFacilities] = useState<string[]>([]);
  const [customFacility, setCustomFacility] = useState('');

  useEffect(() => {
    // Parse selected facilities from comma-separated string
    if (selectedFacilities) {
      setFacilities(selectedFacilities.split(',').map(f => f.trim()).filter(Boolean));
    } else {
      setFacilities([]);
    }
  }, [selectedFacilities]);

  // Get available facilities based on hospital type
  const getAvailableFacilities = () => {
    if (hospitalType === 'Klinik Pribadi') {
      return null; // Will show custom input instead
    }
    return FACILITIES_BY_TYPE[hospitalType as keyof typeof FACILITIES_BY_TYPE] || [];
  };

  const availableFacilities = getAvailableFacilities();

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
    // Convert array to comma-separated string
    onSave(facilities.join(', '));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Fasilitas Kesehatan 1</DialogTitle>
          <DialogDescription>
            Pilih fasilitas kesehatan untuk {hospitalType}
          </DialogDescription>
        </DialogHeader>

        {hospitalType === 'Klinik Pribadi' ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan nama fasilitas"
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomFacility();
                  }
                }}
              />
              <Button type="button" onClick={handleAddCustomFacility}>
                Tambah
              </Button>
            </div>
            
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {facilities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada fasilitas ditambahkan.</p>
                ) : (
                  facilities.map((facility) => (
                    <div key={facility} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{facility}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCustomFacility(facility)}
                      >
                        Hapus
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {availableFacilities && availableFacilities.map((facility) => (
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
        )}

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

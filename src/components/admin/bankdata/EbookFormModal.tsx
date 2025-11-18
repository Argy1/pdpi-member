import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';
import type { AdminEbook } from '@/hooks/useEbooks';

interface EbookFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (ebook: Partial<AdminEbook>) => void;
  ebook: AdminEbook | null;
  onPdfFileChange: (file: File | null) => void;
  onCoverFileChange: (file: File | null) => void;
}

export const EbookFormModal = ({ open, onClose, onSave, ebook, onPdfFileChange, onCoverFileChange }: EbookFormModalProps) => {
  const [formData, setFormData] = useState<Partial<AdminEbook>>({
    title: '',
    subtitle: '',
    category: 'Pedoman',
    tags: [],
    year: new Date().getFullYear(),
    authors: '',
    version: '',
    language: 'ID',
    description: '',
    isActive: true,
    coverUrl: '',
    fileSizeBytes: 0,
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (ebook) {
      setFormData(ebook);
    } else {
      setFormData({
        title: '',
        subtitle: '',
        category: 'Pedoman',
        tags: [],
        year: new Date().getFullYear(),
        authors: '',
        version: '',
        language: 'ID',
        description: '',
        isActive: true,
        coverUrl: '',
        fileSizeBytes: 0,
      });
    }
    setErrors({});
  }, [ebook, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPdfFileChange(file);
      setFormData((prev) => ({
        ...prev,
        fileSizeBytes: file.size,
      }));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCoverFileChange(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Judul wajib diisi';
    }

    if (!formData.authors?.trim()) {
      newErrors.authors = 'Penulis wajib diisi';
    }

    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 10) {
      newErrors.year = 'Tahun tidak valid';
    }

    if (!formData.version?.trim()) {
      newErrors.version = 'Versi wajib diisi';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ebook ? 'Edit E-book' : 'Tambah E-book Baru'}</DialogTitle>
          <DialogDescription>
            {ebook
              ? 'Perbarui informasi e-book yang sudah ada'
              : 'Tambahkan e-book baru ke dalam sistem'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Masukkan judul e-book"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Subjudul</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="Masukkan subjudul (opsional)"
            />
          </div>

          {/* Category & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Kategori <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pedoman">Pedoman</SelectItem>
                  <SelectItem value="Buku Ajar">Buku Ajar</SelectItem>
                  <SelectItem value="Konsensus">Konsensus</SelectItem>
                  <SelectItem value="SOP">SOP</SelectItem>
                  <SelectItem value="Laporan">Laporan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">
                Tahun <span className="text-destructive">*</span>
              </Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                min={1900}
                max={new Date().getFullYear() + 10}
                className={errors.year ? 'border-destructive' : ''}
              />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tag</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ketik tag dan tekan Enter"
              />
              <Button type="button" onClick={handleAddTag} variant="secondary">
                Tambah
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Authors */}
          <div className="space-y-2">
            <Label htmlFor="authors">
              Penulis <span className="text-destructive">*</span>
            </Label>
            <Input
              id="authors"
              value={formData.authors}
              onChange={(e) => handleInputChange('authors', e.target.value)}
              placeholder="Masukkan nama penulis"
              className={errors.authors ? 'border-destructive' : ''}
            />
            {errors.authors && (
              <p className="text-sm text-destructive">{errors.authors}</p>
            )}
          </div>

          {/* Version & Language */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">
                Versi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                placeholder="e.g., Revisi 2023"
                className={errors.version ? 'border-destructive' : ''}
              />
              {errors.version && (
                <p className="text-sm text-destructive">{errors.version}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">
                Bahasa <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value: 'ID' | 'EN') => handleInputChange('language', value)}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ID">Indonesia</SelectItem>
                  <SelectItem value="EN">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Masukkan deskripsi singkat e-book"
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Upload File PDF</Label>
              <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              File PDF maksimal 50MB
            </p>
          </div>

          {/* Cover Upload */}
          <div className="space-y-2">
            <Label htmlFor="cover">Upload Cover (Opsional)</Label>
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
            />
            <p className="text-xs text-muted-foreground">
              Format: JPG, PNG. Maksimal 5MB
            </p>
          </div>

          {/* Active Switch */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive" className="text-base">
                Status Aktif
              </Label>
              <p className="text-sm text-muted-foreground">
                E-book yang aktif akan ditampilkan kepada anggota
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit}>
            {ebook ? 'Simpan Perubahan' : 'Tambah E-book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

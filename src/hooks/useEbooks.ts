import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Ebook {
  id: string;
  title: string;
  subtitle: string | null;
  category: string;
  tags: string[];
  year: number;
  authors: string;
  version: string;
  language: 'ID' | 'EN';
  downloadCount: number;
  fileSizeMB: number;
  coverUrl?: string | null;
  description: string;
  filePath: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: string | null;
}

export interface AdminEbook extends Ebook {
  fileSizeBytes: number;
  updatedAt: Date;
}

export const useEbooks = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch active ebooks for public view
  const fetchActiveEbooks = async (): Promise<Ebook[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('is_active', true)
        .order('year', { ascending: false })
        .order('title', { ascending: true });

      if (error) throw error;

      return (data || []).map(mapDbToEbook);
    } catch (error: any) {
      console.error('Error fetching ebooks:', error);
      toast({
        title: 'Gagal memuat e-book',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch all ebooks for admin
  const fetchAllEbooks = async (): Promise<AdminEbook[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(mapDbToAdminEbook);
    } catch (error: any) {
      console.error('Error fetching admin ebooks:', error);
      toast({
        title: 'Gagal memuat e-book',
        description: error.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Increment download count
  const incrementDownload = async (ebookId: string): Promise<boolean> => {
    try {
      // Direct update since RPC might not exist
      const { data: ebook } = await supabase
        .from('ebooks')
        .select('download_count')
        .eq('id', ebookId)
        .single();

      if (ebook) {
        const { error } = await supabase
          .from('ebooks')
          .update({ download_count: (ebook.download_count || 0) + 1 })
          .eq('id', ebookId);

        if (error) throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error incrementing download:', error);
      return false;
    }
  };

  // Get file download URL
  const getFileUrl = (filePath: string): string => {
    const { data } = supabase.storage.from('ebooks').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Upload file to storage
  const uploadFile = async (
    file: File,
    folder: string = 'pdfs'
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage.from('ebooks').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) throw error;

      return fileName;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Gagal mengunggah file',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create new ebook
  const createEbook = async (
    ebookData: Partial<AdminEbook>,
    pdfFile: File | null,
    coverFile: File | null
  ): Promise<boolean> => {
    setLoading(true);
    try {
      let filePath = '';
      let coverUrl: string | null = null;
      let fileSizeBytes = 0;

      // Upload PDF
      if (pdfFile) {
        const uploadedPath = await uploadFile(pdfFile, `pdfs/${ebookData.year}`);
        if (!uploadedPath) throw new Error('Gagal mengunggah file PDF');
        filePath = uploadedPath;
        fileSizeBytes = pdfFile.size;
      } else {
        throw new Error('File PDF wajib diupload');
      }

      // Upload cover if provided
      if (coverFile) {
        const uploadedCoverPath = await uploadFile(coverFile, 'covers');
        if (uploadedCoverPath) {
          coverUrl = getFileUrl(uploadedCoverPath);
        }
      }

      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from('ebooks').insert({
        title: ebookData.title!,
        subtitle: ebookData.subtitle || null,
        category: ebookData.category!,
        tags: ebookData.tags || [],
        year: ebookData.year!,
        authors: ebookData.authors!,
        version: ebookData.version!,
        language: ebookData.language!,
        description: ebookData.description!,
        file_path: filePath,
        file_size_bytes: fileSizeBytes,
        cover_url: coverUrl,
        is_active: ebookData.isActive ?? true,
        created_by: userData.user?.id || null,
      });

      if (error) throw error;

      toast({
        title: 'E-book ditambahkan',
        description: 'E-book baru berhasil ditambahkan.',
      });

      return true;
    } catch (error: any) {
      console.error('Error creating ebook:', error);
      toast({
        title: 'Gagal menambahkan e-book',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update ebook
  const updateEbook = async (
    ebookId: string,
    ebookData: Partial<AdminEbook>,
    pdfFile: File | null,
    coverFile: File | null
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const updates: any = {
        title: ebookData.title,
        subtitle: ebookData.subtitle || null,
        category: ebookData.category,
        tags: ebookData.tags || [],
        year: ebookData.year,
        authors: ebookData.authors,
        version: ebookData.version,
        language: ebookData.language,
        description: ebookData.description,
        is_active: ebookData.isActive,
      };

      // Upload new PDF if provided
      if (pdfFile) {
        const uploadedPath = await uploadFile(pdfFile, `pdfs/${ebookData.year}`);
        if (!uploadedPath) throw new Error('Gagal mengunggah file PDF');
        updates.file_path = uploadedPath;
        updates.file_size_bytes = pdfFile.size;
      }

      // Upload new cover if provided
      if (coverFile) {
        const uploadedCoverPath = await uploadFile(coverFile, 'covers');
        if (uploadedCoverPath) {
          updates.cover_url = getFileUrl(uploadedCoverPath);
        }
      }

      const { error } = await supabase.from('ebooks').update(updates).eq('id', ebookId);

      if (error) throw error;

      toast({
        title: 'E-book diperbarui',
        description: 'Data e-book berhasil diperbarui.',
      });

      return true;
    } catch (error: any) {
      console.error('Error updating ebook:', error);
      toast({
        title: 'Gagal memperbarui e-book',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleActive = async (ebookId: string, isActive: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('ebooks')
        .update({ is_active: !isActive })
        .eq('id', ebookId);

      if (error) throw error;

      toast({
        title: 'Status diubah',
        description: 'Status e-book berhasil diubah.',
      });

      return true;
    } catch (error: any) {
      console.error('Error toggling active:', error);
      toast({
        title: 'Gagal mengubah status',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  // Delete ebook
  const deleteEbook = async (ebookId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('ebooks').delete().eq('id', ebookId);

      if (error) throw error;

      toast({
        title: 'E-book dihapus',
        description: 'E-book berhasil dihapus dari sistem.',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting ebook:', error);
      toast({
        title: 'Gagal menghapus e-book',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    loading,
    fetchActiveEbooks,
    fetchAllEbooks,
    incrementDownload,
    getFileUrl,
    uploadFile,
    createEbook,
    updateEbook,
    toggleActive,
    deleteEbook,
  };
};

// Helper functions
function mapDbToEbook(row: any): Ebook {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    category: row.category,
    tags: row.tags || [],
    year: row.year,
    authors: row.authors,
    version: row.version,
    language: row.language,
    downloadCount: row.download_count || 0,
    fileSizeMB: parseFloat((row.file_size_bytes / (1024 * 1024)).toFixed(1)),
    coverUrl: row.cover_url,
    description: row.description,
    filePath: row.file_path,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    createdBy: row.created_by,
  };
}

function mapDbToAdminEbook(row: any): AdminEbook {
  return {
    ...mapDbToEbook(row),
    fileSizeBytes: row.file_size_bytes,
    updatedAt: new Date(row.updated_at),
  };
}

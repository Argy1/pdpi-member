import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

// Validation schema
const registrationSchema = z.object({
  nik: z.string()
    .min(16, 'NIK harus 16 digit')
    .max(16, 'NIK harus 16 digit')
    .regex(/^\d+$/, 'NIK hanya boleh berisi angka'),
  email: z.string()
    .email('Format email tidak valid')
    .max(255, 'Email terlalu panjang'),
  password: z.string()
    .min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function RegistrasiPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationForm>({
    nik: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationForm, string>>>({});

  // Normalize NIK (remove spaces, dots, dashes)
  const normalizeNIK = (value: string): string => {
    return value.replace(/[\s\.\-]/g, '');
  };

  const handleNIKChange = (value: string) => {
    const normalized = normalizeNIK(value);
    if (normalized.length <= 16 && /^\d*$/.test(normalized)) {
      setFormData(prev => ({ ...prev, nik: normalized }));
      setErrors(prev => ({ ...prev, nik: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      // Client-side validation
      const validationResult = registrationSchema.safeParse(formData);
      if (!validationResult.success) {
        const fieldErrors: Partial<Record<keyof RegistrationForm, string>> = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof RegistrationForm] = err.message;
          }
        });
        setErrors(fieldErrors);
        setLoading(false);
        return;
      }

      // Call server-side edge function for registration
      const { data, error } = await supabase.functions.invoke('register-with-nik', {
        body: {
          nik: formData.nik,
          email: formData.email,
          password: formData.password
        }
      });

      if (error) throw error;

      if (!data.success) {
        toast({
          variant: "destructive",
          title: "Registrasi Gagal",
          description: data.error || "Terjadi kesalahan saat registrasi"
        });
        setLoading(false);
        return;
      }

      // Success
      toast({
        title: "Registrasi Berhasil! ✓",
        description: data.message || "Profil Anda sudah terhubung dengan data anggota.",
      });

      // Redirect to profile page
      setTimeout(() => {
        navigate('/profil-saya');
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Terjadi kesalahan tidak terduga"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold">Registrasi Anggota PDPI</CardTitle>
          <CardDescription>
            Buat akun baru untuk mengakses sistem keanggotaan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Banner */}
          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-sm">
              <strong>Penting:</strong> Hanya NIK yang sudah terdaftar di PDPI yang bisa registrasi. 
              Pastikan data Anda sudah tercatat di sekretariat PD.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NIK Field */}
            <div className="space-y-2">
              <Label htmlFor="nik">
                NIK (16 Digit) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nik"
                type="text"
                placeholder="1234567890123456"
                value={formData.nik}
                onChange={(e) => handleNIKChange(e.target.value)}
                maxLength={16}
                className={errors.nik ? 'border-destructive' : ''}
                disabled={loading}
                required
              />
              {errors.nik && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.nik}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Nomor Induk Kependudukan (16 digit angka)
              </p>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                className={errors.email ? 'border-destructive' : ''}
                disabled={loading}
                required
              />
              {errors.email && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, password: e.target.value }));
                  setErrors(prev => ({ ...prev, password: undefined }));
                }}
                className={errors.password ? 'border-destructive' : ''}
                disabled={loading}
                required
              />
              {errors.password && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Konfirmasi Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }}
                className={errors.confirmPassword ? 'border-destructive' : ''}
                disabled={loading}
                required
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Daftar Sekarang
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Login di sini
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import logoImage from "@/assets/logo-pdpi.png"
import { z } from "zod"

// Validation schema
const registerSchema = z.object({
  name: z.string().length(16, "NIK harus 16 digit").regex(/^\d{16}$/, "NIK harus berisi angka saja"),
  email: z.string().email("Email tidak valid").max(255, "Email maksimal 255 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter").max(100, "Password maksimal 100 karakter"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"]
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isAdmin, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const [verificationStep, setVerificationStep] = useState<"form" | "verify">("form")
  const [verificationCode, setVerificationCode] = useState("")
  const [registeredEmail, setRegisteredEmail] = useState("")
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  // Redirect after successful login
  useEffect(() => {
    if (user && isAdmin) {
      navigate("/admin")
    } else if (user) {
      navigate("/")
    }
  }, [user, isAdmin, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        if (error.message === "Invalid login credentials") {
          setError("Email atau password tidak valid")
        } else if (error.message === "Email not confirmed") {
          setError("Email belum dikonfirmasi. Silakan cek email Anda")
        } else {
          setError(error.message)
        }
      } else {
        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!",
        })
        // Will be handled by useEffect below after auth state updates
      }
    } catch (err) {
      setError("Terjadi kesalahan yang tidak terduga")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validate form data
      registerSchema.parse(registerData)

      // Sign up with Supabase - Pass NIK as 'nik' not 'name'
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nik: registerData.name  // Pass as 'nik' to match trigger expectations
          }
        }
      })

      if (error) {
        // Parse specific error messages from trigger
        if (error.message.includes("REGISTRASI_HANYA_UNTUK_ANGGOTA")) {
          setError("Pendaftaran hanya untuk anggota terdaftar. Silakan gunakan NIK Anda untuk mendaftar.")
        } else if (error.message.includes("NIK_FORMAT_INVALID")) {
          setError("NIK harus terdiri dari 16 digit angka.")
        } else if (error.message.includes("NIK_NOT_FOUND")) {
          setError("NIK tidak terdaftar dalam database anggota. Silakan hubungi sekretariat PD Anda untuk mendaftarkan data terlebih dahulu.")
        } else if (error.message.includes("NIK_ALREADY_USED")) {
          setError("NIK sudah terdaftar dan terhubung dengan akun lain. Jika ini adalah kesalahan, silakan hubungi administrator.")
        } else if (error.message.includes("User already registered")) {
          setError("Email sudah terdaftar. Silakan gunakan email lain atau login.")
        } else if (error.message.includes("Database error")) {
          setError("Terjadi kesalahan database. Pastikan NIK Anda sudah terdaftar di sistem.")
        } else {
          setError(error.message)
        }
      } else if (data.user) {
        setRegisteredEmail(registerData.email)
        setVerificationStep("verify")
        setSuccess("Kode verifikasi 6 digit telah dikirim ke email Anda. Silakan cek inbox atau folder spam.")
        toast({
          title: "Email verifikasi terkirim",
          description: "Silakan cek email Anda dan masukkan kode verifikasi 6 digit.",
        })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else {
        setError("Terjadi kesalahan yang tidak terduga")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: registeredEmail,
        token: verificationCode,
        type: 'signup'
      })

      if (error) {
        setError("Kode verifikasi tidak valid atau sudah kadaluarsa")
      } else {
        toast({
          title: "Email berhasil diverifikasi",
          description: "Akun Anda telah aktif. Silakan login.",
        })
        setActiveTab("login")
        setVerificationStep("form")
        setRegisterData({
          name: "",
          email: "",
          password: "",
          confirmPassword: ""
        })
        setVerificationCode("")
      }
    } catch (err) {
      setError("Terjadi kesalahan saat verifikasi")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError("")
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      })

      if (error) {
        setError("Gagal mengirim ulang kode verifikasi")
      } else {
        toast({
          title: "Kode verifikasi terkirim ulang",
          description: "Silakan cek email Anda.",
        })
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim ulang kode")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle bg-grid">
      <div className="container-pdpi py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-md card-glass">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full overflow-hidden bg-white shadow-lg">
                  <img 
                    src={logoImage} 
                    alt="PDPI Logo" 
                    className="h-12 w-12 object-contain"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold heading-medical">
                  Admin PDPI
                </CardTitle>
                <CardDescription className="text-medical-body">
                  Masuk atau daftar untuk mengakses panel admin
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Registrasi</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-6">
                  {error && activeTab === "login" && (
                    <Alert className="border-warning/20 bg-warning/10">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <AlertDescription className="text-warning">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@pdpi.org"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="focus-visible"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="pr-10 focus-visible"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 font-semibold focus-visible"
                      disabled={isLoading}
                    >
                      {isLoading ? "Memproses..." : "Masuk"}
                    </Button>
                  </form>

                  <div className="text-center">
                    <Button variant="link" size="sm" className="text-muted-foreground">
                      Lupa password?
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-6">
                  {verificationStep === "form" ? (
                    <>
                      {error && activeTab === "register" && (
                        <Alert className="border-warning/20 bg-warning/10">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <AlertDescription className="text-warning">
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}

                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name" className="text-sm font-medium">
                            NIK
                          </Label>
                          <Input
                            id="register-name"
                            name="name"
                            type="text"
                            placeholder="3175021408740012"
                            value={registerData.name}
                            onChange={handleRegisterInputChange}
                            required
                            maxLength={16}
                            pattern="[0-9]{16}"
                            title="NIK harus 16 digit angka"
                            className="focus-visible"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-email" className="text-sm font-medium">
                            Email
                          </Label>
                          <Input
                            id="register-email"
                            name="email"
                            type="email"
                            placeholder="admin@pdpi.org"
                            value={registerData.email}
                            onChange={handleRegisterInputChange}
                            required
                            className="focus-visible"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-password" className="text-sm font-medium">
                            Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="register-password"
                              name="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Minimal 6 karakter"
                              value={registerData.password}
                              onChange={handleRegisterInputChange}
                              required
                              className="pr-10 focus-visible"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-confirm-password" className="text-sm font-medium">
                            Konfirmasi Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="register-confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Ketik ulang password"
                              value={registerData.confirmPassword}
                              onChange={handleRegisterInputChange}
                              required
                              className="pr-10 focus-visible"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 font-semibold focus-visible"
                          disabled={isLoading}
                        >
                          {isLoading ? "Memproses..." : "Daftar"}
                        </Button>
                      </form>
                    </>
                  ) : (
                    <>
                      {error && (
                        <Alert className="border-warning/20 bg-warning/10">
                          <AlertCircle className="h-4 w-4 text-warning" />
                          <AlertDescription className="text-warning">
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {success && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            {success}
                          </AlertDescription>
                        </Alert>
                      )}

                      <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="verification-code" className="text-sm font-medium">
                            Kode Verifikasi (6 digit)
                          </Label>
                          <Input
                            id="verification-code"
                            name="verificationCode"
                            type="text"
                            placeholder="000000"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            maxLength={6}
                            className="focus-visible text-center text-2xl tracking-widest font-mono"
                          />
                          <p className="text-xs text-muted-foreground text-center">
                            Email dikirim ke: <strong>{registeredEmail}</strong>
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-11 font-semibold focus-visible"
                          disabled={isLoading || verificationCode.length !== 6}
                        >
                          {isLoading ? "Memverifikasi..." : "Verifikasi Email"}
                        </Button>

                        <div className="text-center space-y-2">
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={handleResendCode}
                            disabled={isLoading}
                            className="text-muted-foreground"
                          >
                            Kirim ulang kode verifikasi
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setVerificationStep("form")
                              setVerificationCode("")
                              setError("")
                              setSuccess("")
                            }}
                          >
                            ← Kembali ke form registrasi
                          </Button>
                        </div>
                      </form>
                    </>
                  )}
                </TabsContent>
              </Tabs>

              <div className="text-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/">
                    ← Kembali ke beranda
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import logoImage from "@/assets/logo-pdpi.png"

export default function LoginPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate("/")
      }
    }
    checkUser()
  }, [navigate])

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
        navigate("/")
      }
    } catch (err) {
      setError("Terjadi kesalahan yang tidak terduga")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const redirectUrl = `${window.location.origin}/`
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl
        }
      })

      if (error) {
        if (error.message === "User already registered") {
          setError("Email sudah terdaftar. Silakan login atau gunakan email lain")
        } else if (error.message.includes("Password")) {
          setError("Password minimal 6 karakter")
        } else {
          setError(error.message)
        }
      } else {
        toast({
          title: "Registrasi berhasil",
          description: "Silakan cek email Anda untuk konfirmasi",
        })
      }
    } catch (err) {
      setError("Terjadi kesalahan yang tidak terduga")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle bg-grid">
      <div className="container-pdpi">
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
                  Login Admin
                </CardTitle>
                <CardDescription className="text-medical-body">
                  Masuk ke panel admin PDPI Directory
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-warning/20 bg-warning/10">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription className="text-warning">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Masuk</TabsTrigger>
                  <TabsTrigger value="signup">Daftar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4 mt-6">
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

                <TabsContent value="signup" className="space-y-4 mt-6">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="email@domain.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="focus-visible"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimal 6 karakter"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength={6}
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
                      {isLoading ? "Memproses..." : "Daftar"}
                    </Button>
                  </form>
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
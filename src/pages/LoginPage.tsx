import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
      setError("Demo: Login functionality will be implemented with backend integration")
    }, 1000)
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
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-white">
                  <Stethoscope className="h-7 w-7" />
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

              <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-4">
                <div className="text-center">
                  <Button variant="link" size="sm" className="text-muted-foreground">
                    Lupa password?
                  </Button>
                </div>

                <div className="text-center">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/">
                      ← Kembali ke beranda
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
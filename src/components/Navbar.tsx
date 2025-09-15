import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserCircle } from "lucide-react"
import logoImage from "@/assets/logo-pdpi.png"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-pdpi">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 transition-smooth hover:opacity-80">
            <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-white shadow-md">
              <img 
                src={logoImage} 
                alt="PDPI Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold heading-medical">PDPI</h1>
              <p className="text-xs text-muted-foreground">Direktori Anggota</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth"
            >
              Beranda
            </Link>
            <Link 
              to="/anggota" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth"
            >
              Tabel Anggota
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex focus-visible"
              asChild
            >
              <Link to="/login">
                <UserCircle className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
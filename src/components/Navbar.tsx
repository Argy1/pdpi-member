import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserCircle, LogOut, Settings } from "lucide-react"
import logoImage from "@/assets/logo-pdpi.png"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
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
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="focus-visible">
                    <UserCircle className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profile && (
                    <DropdownMenuItem disabled>
                      Role: {profile.role}
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Dashboard Admin
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="focus-visible"
                asChild
              >
                <Link to="/login">
                  <UserCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
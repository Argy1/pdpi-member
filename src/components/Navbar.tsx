import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserCircle, LogOut, Settings, Menu } from "lucide-react"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from "react"

export function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

          {/* Navigation Links - Desktop */}
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
            <Link 
              to="/sebaran" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth"
            >
              Sebaran Anggota
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  <Link 
                    to="/" 
                    className="text-base font-medium text-foreground hover:text-primary transition-smooth py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Beranda
                  </Link>
                  <Link 
                    to="/anggota" 
                    className="text-base font-medium text-foreground hover:text-primary transition-smooth py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tabel Anggota
                  </Link>
                  <Link 
                    to="/sebaran" 
                    className="text-base font-medium text-foreground hover:text-primary transition-smooth py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sebaran Anggota
                  </Link>
                  
                  {user && (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <Link 
                          to="/admin" 
                          className="text-base font-medium text-foreground hover:text-primary transition-smooth py-2 flex items-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Dashboard Admin
                        </Link>
                      </div>
                    </>
                  )}
                  
                  {user && (
                    <div className="border-t pt-4 mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => {
                          signOut()
                          setMobileMenuOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

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
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      Dashboard Admin
                    </Link>
                  </DropdownMenuItem>
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
import { Link } from "react-router-dom"
import { Stethoscope } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container-pdpi">
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-white">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">PDPI Directory</h3>
                <p className="text-xs text-muted-foreground">Perhimpunan Dokter Paru Indonesia</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-6">
              <Link 
                to="/anggota" 
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                Tabel Anggota
              </Link>
              <Link 
                to="/login" 
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                Admin Login
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-center text-xs text-muted-foreground">
              © 2024 Perhimpunan Dokter Paru Indonesia. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
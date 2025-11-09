import { Link } from "react-router-dom"
import logoImage from "@/assets/logo-pdpi.png"
import { useTranslation } from "react-i18next"

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container-pdpi">
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full overflow-hidden bg-white shadow-md">
                <img 
                  src={logoImage} 
                  alt="PDPI Logo" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{t('footer.title')}</h3>
                <p className="text-xs text-muted-foreground">{t('footer.subtitle')}</p>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-6">
              <Link 
                to="/anggota" 
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                {t('footer.memberTable')}
              </Link>
              <Link 
                to="/login" 
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                {t('footer.adminLogin')}
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-center text-xs text-muted-foreground">
              © 2024 {t('footer.credit')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
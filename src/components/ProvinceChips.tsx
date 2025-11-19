import { useNavigate } from "react-router-dom"
import { useTranslation } from 'react-i18next'

const topProvinces = [
  "DKI Jakarta",
  "Jawa Barat", 
  "Jawa Timur",
  "Jawa Tengah",
  "Sumatera Utara"
]

export function ProvinceChips() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  const handleProvinceClick = (province: string) => {
    navigate(`/anggota?provinsi=${encodeURIComponent(province)}`)
  }

  const label = i18n.language === 'en' 
    ? 'Provinces with most members:' 
    : 'Provinsi dengan anggota terbanyak:'

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {topProvinces.map((province) => (
          <button
            key={province}
            onClick={() => handleProvinceClick(province)}
            className="chip hover:chip-selected transition-smooth"
          >
            {province}
          </button>
        ))}
      </div>
    </div>
  )
}
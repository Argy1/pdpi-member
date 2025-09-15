import { useNavigate } from "react-router-dom"

const topProvinces = [
  "DKI Jakarta",
  "Jawa Barat", 
  "Jawa Timur",
  "Jawa Tengah",
  "Sumatera Utara"
]

export function ProvinceChips() {
  const navigate = useNavigate()

  const handleProvinceClick = (province: string) => {
    navigate(`/anggota?provinsi=${encodeURIComponent(province)}`)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Provinsi dengan anggota terbanyak:
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
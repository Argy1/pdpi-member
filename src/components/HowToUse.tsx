import { Search, Filter, Eye } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Cari Anggota",
    description: "Gunakan kotak pencarian untuk mencari berdasarkan nama, rumah sakit, atau lokasi"
  },
  {
    icon: Filter,
    title: "Filter Data",
    description: "Gunakan filter provinsi, PD, atau subspesialis untuk mempersempit hasil"
  },
  {
    icon: Eye,
    title: "Lihat Detail",
    description: "Klik pada baris anggota untuk melihat informasi lengkap dalam modal"
  }
]

export function HowToUse() {
  return (
    <div className="section-spacing">
      <div className="container-pdpi">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold heading-medical mb-4">
            Cara Menggunakan
          </h2>
          <p className="text-lg text-medical-body max-w-2xl mx-auto">
            Panduan singkat untuk menggunakan direktori anggota PDPI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="card-glass p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-white">
                  <step.icon className="h-8 w-8" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold heading-medical">
                    {step.title}
                  </h3>
                </div>
                <p className="text-medical-body">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
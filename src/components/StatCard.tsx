import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="card-glass p-6 transition-smooth hover:shadow-strong group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <p className="text-3xl font-bold heading-medical group-hover:text-primary transition-smooth">
              {value}
            </p>
            {description && (
              <p className="text-sm text-medical-body">{description}</p>
            )}
            {trend && (
              <div className="flex items-center space-x-1">
                <span 
                  className={`text-xs font-medium ${
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground">vs bulan lalu</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-smooth">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
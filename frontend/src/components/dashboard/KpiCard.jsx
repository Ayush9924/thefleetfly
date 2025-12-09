import { cn } from '../../lib/utils'
import { Card, CardContent, CardHeader } from '../ui/card'
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react'

export function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  loading = false, 
  trend = null, 
  warning = false 
}) {
  return (
    <Card className={cn("relative overflow-hidden", warning && "border-yellow-200 bg-yellow-50")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h4 className="text-sm font-medium text-gray-600">{title}</h4>
        <div className={cn(
          "p-2 rounded-lg",
          warning ? "bg-yellow-100" : "bg-blue-100"
        )}>
          <Icon className={cn(
            "h-4 w-4",
            warning ? "text-yellow-600" : "text-blue-600"
          )} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {trend !== null && (
              <div className="flex items-center space-x-1 mt-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.value.toFixed(1)}% vs last week
                </span>
              </div>
            )}
            {warning && (
              <div className="flex items-center space-x-1 mt-2">
                <AlertCircle className="h-3 w-3 text-yellow-600" />
                <span className="text-xs text-yellow-600">Attention needed</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

import type React from "react"
import { Package, Layers, ShoppingCart, Users, Truck, Warehouse, AlertTriangle, FileText } from "lucide-react"

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalCustomers: number
  totalVendors: number
  totalWarehouses: number
  pendingPurchaseOrders: number
  lowStockItems: number
  lastOrderDate: string | null
}

const formatDate = (date: string | null) => {
  if (!date) return "No orders yet"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  index,
  accent = 'hsl(var(--primary))',
}: {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  index: number
  accent?: string
}) => (
  <div
    className="group relative overflow-hidden rounded-lg border bg-card p-5 hover:shadow-md transition-all duration-300"
    style={{
      animation: 'fadeInUp 0.5s ease-out backwards',
      animationDelay: `${index * 60}ms`
    }}
  >
    {/* Decorative accent dot */}
    <div
     	className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
     	style={{ backgroundColor: accent }}
    />

    {/* Icon container */}
    <div className="flex items-start gap-3 mb-4">
     	<div
       	className="inline-flex p-2 rounded-md bg-muted"
     	>
       	<span style={{ color: accent, display: 'flex' }}>
       		<Icon className="h-4 w-4" />
       	</span>
     	</div>
     	<div className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
       	{(index + 1).toString().padStart(2, '0')}
     	</div>
    </div>

    {/* Value */}
    <div
     	className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-1 tabular-nums"
     	style={{ fontFamily: "'Instrument Serif', serif" }}
    >
     	{value}
    </div>

    {/* Title */}
    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
     	{title}
    </div>

    {/* Subtitle */}
    {subtitle && (
     	<div className="text-xs text-muted-foreground/70 mt-2">
     		{subtitle}
     	</div>
    )}
  </div>
)

export function SectionCards({
  stats,
  loading,
}: {
  stats: DashboardStats | null
  loading?: boolean
}) {
  const safeStats: DashboardStats = stats ?? {
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalWarehouses: 0,
    pendingPurchaseOrders: 0,
    lowStockItems: 0,
    lastOrderDate: null,
  }

  const cardConfigs = [
    { title: "Products", value: safeStats.totalProducts, subtitle: "Active in catalog", icon: Package, accent: "hsl(25 95% 53%)" },
    { title: "Categories", value: safeStats.totalCategories, subtitle: "Active categories", icon: Layers, accent: "hsl(199 89% 48%)" },
    { title: "Orders", value: safeStats.totalOrders, subtitle: `Last: ${formatDate(safeStats.lastOrderDate)}`, icon: ShoppingCart, accent: "hsl(142 76% 36%)" },
    { title: "Customers", value: safeStats.totalCustomers, subtitle: "Unique by mobile", icon: Users, accent: "hsl(38 92% 50%)" },
    { title: "Vendors", value: safeStats.totalVendors, subtitle: "Active vendors", icon: Truck, accent: "hsl(262 83% 58%)" },
    { title: "Warehouses", value: safeStats.totalWarehouses, subtitle: "Storage locations", icon: Warehouse, accent: "hsl(174 72% 56%)" },
    { title: "Pending POs", value: safeStats.pendingPurchaseOrders, subtitle: "Awaiting approval", icon: FileText, accent: "hsl(330 81% 60%)" },
    { title: "Low Stock", value: safeStats.lowStockItems, subtitle: "At reorder point", icon: AlertTriangle, accent: "hsl(15 90% 60%)" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardConfigs.map((config, index) => (
        <StatCard
          key={config.title}
          title={config.title}
          value={loading ? "—" : config.value}
          subtitle={config.subtitle}
          icon={config.icon}
          index={index}
          accent={config.accent}
        />
      ))}
    </div>
  )
}

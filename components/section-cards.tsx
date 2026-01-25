import type React from "react"
import { Package, Layers, ShoppingCart, Users, Truck, Warehouse, AlertTriangle, FileText } from "lucide-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
}: {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
}) => (
  <Card className="@container/card">
    <CardHeader>
      <CardDescription className="flex items-center justify-between gap-3">
        <span>{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {value}
      </CardTitle>
      {subtitle ? (
        <CardDescription className="text-xs">{subtitle}</CardDescription>
      ) : null}
    </CardHeader>
  </Card>
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

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        title="Products"
        value={loading ? "—" : safeStats.totalProducts}
        subtitle="Active products in catalog"
        icon={Package}
      />
      <StatCard
        title="Categories"
        value={loading ? "—" : safeStats.totalCategories}
        subtitle="Active categories"
        icon={Layers}
      />
      <StatCard
        title="Orders"
        value={loading ? "—" : safeStats.totalOrders}
        subtitle={`Last order: ${formatDate(safeStats.lastOrderDate)}`}
        icon={ShoppingCart}
      />
      <StatCard
        title="Customers"
        value={loading ? "—" : safeStats.totalCustomers}
        subtitle="Unique customers (by mobile)"
        icon={Users}
      />
      <StatCard
        title="Vendors"
        value={loading ? "—" : safeStats.totalVendors}
        subtitle="Active vendors"
        icon={Truck}
      />
      <StatCard
        title="Warehouses"
        value={loading ? "—" : safeStats.totalWarehouses}
        subtitle="Storage locations"
        icon={Warehouse}
      />
      <StatCard
        title="Pending POs"
        value={loading ? "—" : safeStats.pendingPurchaseOrders}
        subtitle="Purchase orders awaiting approval"
        icon={FileText}
      />
      <StatCard
        title="Low Stock"
        value={loading ? "—" : safeStats.lowStockItems}
        subtitle="Items at/below reorder point"
        icon={AlertTriangle}
      />
    </div>
  )
}

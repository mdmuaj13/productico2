import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Layers, 
  Truck, 
  Warehouse,
  Boxes,
  BarChart2,
  Users,
  Settings,
  FileBarChart2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}) => (
  <Link
    href={href}
    className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${color} bg-opacity-10 hover:bg-opacity-20 border border-opacity-30 active:scale-95`}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1.5 sm:space-y-2">
        <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-3 sm:mb-4 ${color} bg-opacity-20`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 sm:mt-1 text-gray-400 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
);

export default function Home() {
  const features = [
    {
      title: "Dashboard",
      description: "Get an overview of your business performance",
      icon: BarChart2,
      href: "/app/dashboard",
      color: "text-blue-500"
    },
    {
      title: "Products",
      description: "Manage your product catalog and inventory",
      icon: Package,
      href: "/app/products",
      color: "text-emerald-500"
    },
    {
      title: "Categories",
      description: "Organize products into categories",
      icon: Layers,
      href: "/app/categories",
      color: "text-amber-500"
    },
    {
      title: "Purchase Orders",
      description: "Create and track purchase orders",
      icon: FileText,
      href: "/app/purchase-orders",
      color: "text-purple-500"
    },
    {
      title: "Vendors",
      description: "Manage your suppliers and vendors",
      icon: Truck,
      href: "/app/vendors",
      color: "text-red-500"
    },
    {
      title: "Warehouses",
      description: "Manage multiple storage locations",
      icon: Warehouse,
      href: "/app/warehouses",
      color: "text-indigo-500"
    },
    {
      title: "Inventory",
      description: "Track stock levels and movements",
      icon: Boxes,
      href: "/app/inventory",
      color: "text-cyan-500"
    },
    {
      title: "Reports",
      description: "Generate detailed business reports",
      icon: FileBarChart2,
      href: "/app/reports",
      color: "text-pink-500"
    },
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: Users,
      href: "/app/users",
      color: "text-green-500"
    },
    {
      title: "Settings",
      description: "Configure application settings",
      icon: Settings,
      href: "/app/settings",
      color: "text-gray-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header with navigation */}
      <header className="w-full border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Productico
              </span>
            </div>
            <nav className="flex flex-wrap justify-center gap-2 w-full sm:w-auto">
              <Button asChild variant="ghost" size="sm" className="text-sm px-3 py-1 h-9 sm:h-10">
                <Link href="/app/dashboard" className="flex items-center gap-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden xs:inline">Dashboard</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="text-sm px-3 py-1 h-9 sm:h-10">
                <Link href="/login" className="flex items-center gap-1">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden xs:inline">Login</span>
                </Link>
              </Button>
              <Button asChild size="sm" className="text-sm px-3 py-1 h-9 sm:h-10">
                <Link href="/signup" className="flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden xs:inline">Sign up</span>
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center space-y-2 sm:space-y-3 mb-8 sm:mb-12 px-2">
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Welcome to Productico
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Your complete inventory and order management solution
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-2 sm:px-0">
            {features.map((feature, index) => (
              <QuickActionCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Package, ShoppingCart, Calendar, Users } from "lucide-react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import DashboardPage from "./dashboard/page";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  lastOrderDate: string | null;
  totalCustomers: number;
}

const AppPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (date: string | null) => {
    if (!date) return "No orders yet";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-1 min-h-screen items-center justify-center">
        <Spinner variant="pinwheel" />
      </div>
    );
  }

  return (
    <DashboardPage />
    // <div className="p-6">
    //   <div className="mb-6">
    //     <h1 className="text-3xl font-bold">Dashboard</h1>
    //   </div>

    //   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    //     <StatCard
    //       title="Total Products"
    //       value={stats?.totalProducts || 0}
    //       icon={Package}
    //       description="Active products in catalog"
    //       color="blue"
    //     />
    //     <StatCard
    //       title="Total Orders"
    //       value={stats?.totalOrders || 0}
    //       icon={ShoppingCart}
    //       description="Orders received"
    //       color="green"
    //     />
    //     <StatCard
    //       title="Last Order Date"
    //       value={formatDate(stats?.lastOrderDate || null)}
    //       icon={Calendar}
    //       description="Most recent order"
    //       color="orange"
    //     />
    //     <StatCard
    //       title="Total Customers"
    //       value={stats?.totalCustomers || 0}
    //       icon={Users}
    //       description="Unique customers"
    //       color="purple"
    //     />
    //   </div>
    // </div>
  );
};

export default AppPage;
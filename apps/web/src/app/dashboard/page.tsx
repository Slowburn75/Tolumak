"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { client } from "@/utils/orpc"; // Client side? Dashboard is protected, can use client-side fetch or server.
// Standard pattern: Admin Dashboard often has high interactivity, so Client Components are fine.
// BUT better to use Server Component for initial data if possible.
// Wait, Layout is Client Component (hooks). Child page can be Server Component.
// BUT `layout.tsx` is "use client". This forces children to be rendered in client context usually?
// No, children of client component can be server components.

// I'll make Page a Client Component using `useQuery` for live updates, OR Server Component.
// Let's use Client Component for simplicity with `orpc` hooks since we need to fetch multiple stats.
// Wait, `orpc` hooks are better.

import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/utils/format";
import { Users, CreditCard, DollarSign, Package } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery(orpc.admin.dashboard.getStats.queryOptions());

  if (isLoading) {
    return <div>Loading dashboard stats...</div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.lowStockProducts} low stock</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Revenue</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Chart Placeholder
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{order.user.name}</p>
                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  </div>
                  <div className="ml-auto font-medium">{formatPrice(order.total)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

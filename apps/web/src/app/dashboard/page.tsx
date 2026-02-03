"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
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
import { Users, CreditCard, DollarSign, Package, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useQuery(
    orpc.admin.dashboard.getOverview.queryOptions()
  );
  const { data: recentOrders, isLoading: ordersLoading } = useQuery(
    orpc.admin.dashboard.getRecentOrders.queryOptions({ limit: 5 })
  );

  if (overviewLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!overview || !recentOrders) return null;

  const totalOrdersCount = Object.values(overview.totalOrders).reduce((a, b) => a + b, 0);

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
            <div className="text-2xl font-bold">{formatPrice(overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrdersCount}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {overview.lowStockCount} items low stock
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCustomers}</div>
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
              Chart Placeholder (Real chart coming soon)
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}` as any}
                  className="flex items-center hover:bg-muted/50 p-2 rounded-lg transition-colors border-none text-inherit decoration-inherit"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{order.user.name}</p>
                    <p className="text-sm text-muted-foreground">{order.user.email}</p>
                  </div>
                  <div className="ml-auto font-medium text-right">
                    <div>{formatPrice(order.total)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">
                      {order.status.replace("_", " ")}
                    </div>
                  </div>
                </Link>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent sales</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

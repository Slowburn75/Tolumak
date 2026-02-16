"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Search, Eye, Loader2, Download } from "lucide-react";
import { formatPrice } from "@/utils/format";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/empty-state";

type CustomerSegment = "all" | "new" | "active" | "vip" | "inactive";

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [segment, setSegment] = useState<CustomerSegment>("all");

    const { data, isLoading } = useQuery(
        orpc.admin.customers.list.queryOptions({
            input: {
                search: search || undefined,
                page,
                limit: 10,
                hasOrders: segment === "active" || segment === "vip" ? true : undefined,
                isActive: segment === "inactive" ? false : undefined,
            },
        })
    );

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "Never";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const exportCustomers = () => {
        if (!data?.customers) return;

        const csvContent = [
            ["Name", "Email", "Phone", "Total Orders", "Total Spent", "Registered"],
            ...data.customers.map((c: any) => [
                c.name,
                c.email,
                c.phone || "",
                c._count?.orders || 0,
                c.totalSpent || 0,
                c.createdAt,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `customers-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    const segmentTabs: { label: string; value: CustomerSegment }[] = [
        { label: "All", value: "all" },
        { label: "New (30d)", value: "new" },
        { label: "Active", value: "active" },
        { label: "VIP", value: "vip" },
        { label: "Inactive", value: "inactive" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                <Button variant="outline" onClick={exportCustomers}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
                    {segmentTabs.map((tab) => (
                        <Button
                            key={tab.value}
                            variant={segment === tab.value ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setSegment(tab.value);
                                setPage(1);
                            }}
                            className="whitespace-nowrap"
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name, email, or phone..."
                        className="pl-8 w-full"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading customers...
                    </div>
                ) : data?.customers.length === 0 ? (
                    <EmptyState
                        title="No customers found"
                        description="No customers match your current filters."
                    />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Registered</TableHead>
                                <TableHead>Orders</TableHead>
                                <TableHead>Total Spent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.customers.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{customer.name}</span>
                                            <span className="text-xs text-muted-foreground">{customer.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {customer.phone || "N/A"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(customer.createdAt.toString())}
                                    </TableCell>
                                    <TableCell>{customer._count?.orders || 0}</TableCell>
                                    <TableCell className="font-medium">
                                        {formatPrice(customer.totalSpent || 0)}
                                    </TableCell>
                                    <TableCell>
                                        {customer.isActive ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/customers/${customer.id}` as any}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye className="h-4 w-4" />
                                                <span className="sr-only">View</span>
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {data && data.customers.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {data.customers.length} of {data.total} customers (Page {data.page} of{" "}
                        {data.totalPages})
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= data.totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash, Power, Loader2 } from "lucide-react";
import { formatPrice } from "@/utils/format";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/admin/progress-bar";
import { EmptyState } from "@/components/admin/empty-state";
import { toast } from "sonner";

type CouponStatus = "active" | "expired" | "upcoming" | "all";

export default function CouponsPage() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<CouponStatus>("all");
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery(
        orpc.admin.coupons.list.queryOptions({
            input: {
                search: search || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined,
                page,
                limit: 10,
            },
        })
    );

    const { mutateAsync: deleteCoupon, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => client.admin.coupons.delete({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.coupons.list.queryKey({ input: {} }) });
            toast.success("Coupon deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete coupon");
        },
    });

    const { mutateAsync: toggleActive } = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            isActive ? client.admin.coupons.deactivate({ id }) : client.admin.coupons.activate({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.coupons.list.queryKey({ input: {} }) });
            toast.success("Coupon status updated");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update coupon");
        },
    });

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            await deleteCoupon(id);
        }
    };

    const getCouponStatus = (coupon: any): string => {
        const now = new Date();
        const validFrom = new Date(coupon.validFrom);
        const validUntil = new Date(coupon.validUntil);

        if (!coupon.isActive) return "inactive";
        if (now < validFrom) return "upcoming";
        if (now > validUntil) return "expired";
        return "active";
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
            case "expired":
                return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
            case "upcoming":
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Upcoming</Badge>;
            case "inactive":
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTypeBadge = (type: string) => {
        return type === "PERCENTAGE" ? (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">%</Badge>
        ) : (
            <Badge className="bg-green-100 text-green-800 border-green-200">₦</Badge>
        );
    };

    const formatValue = (type: string, value: number) => {
        return type === "PERCENTAGE" ? `${value}%` : formatPrice(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const statusTabs: { label: string; value: CouponStatus }[] = [
        { label: "All", value: "all" },
        { label: "Active", value: "active" },
        { label: "Expired", value: "expired" },
        { label: "Upcoming", value: "upcoming" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
                <Link href="/dashboard/coupons/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Coupon
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <Button
                            key={tab.value}
                            variant={statusFilter === tab.value ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => {
                                setStatusFilter(tab.value);
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
                        placeholder="Search by code or description..."
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
                        Loading coupons...
                    </div>
                ) : data?.coupons.length === 0 ? (
                    <EmptyState
                        title="No coupons found"
                        description="Create your first coupon to start offering discounts."
                        action={{
                            label: "Create Coupon",
                            onClick: () => window.location.href = "/dashboard/coupons/new",
                        }}
                    />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Usage</TableHead>
                                <TableHead>Valid Period</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.coupons.map((coupon: any) => {
                                const status = getCouponStatus(coupon);
                                return (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-mono font-medium uppercase">
                                            {coupon.code}
                                        </TableCell>
                                        <TableCell>{getTypeBadge(coupon.type)}</TableCell>
                                        <TableCell className="font-medium">
                                            {formatValue(coupon.type, coupon.value)}
                                        </TableCell>
                                        <TableCell className="min-w-[150px]">
                                            <ProgressBar
                                                value={coupon.usageCount}
                                                max={coupon.usageLimit ?? 0}
                                            />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger
                                                    render={
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Menu</span>
                                                        </Button>
                                                    }
                                                />
                                                <DropdownMenuContent align="end">
                                                    <Link href={`/dashboard/coupons/${coupon.id}/stats` as any}>
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" /> View Stats
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <Link href={`/dashboard/coupons/${coupon.id}` as any}>
                                                        <DropdownMenuItem>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            toggleActive({ id: coupon.id, isActive: coupon.isActive })
                                                        }
                                                    >
                                                        <Power className="mr-2 h-4 w-4" />
                                                        {coupon.isActive ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(coupon.id)}
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {data && data.coupons.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {data.coupons.length} of {data.total} coupons (Page {data.page} of{" "}
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

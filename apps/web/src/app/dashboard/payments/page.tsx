"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Search, MoreHorizontal, Eye, Check, X, Loader2 } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ImageLightbox } from "@/components/admin/image-lightbox";
import { EmptyState } from "@/components/admin/empty-state";
import { toast } from "sonner";

type PaymentStatus = "PENDING" | "AWAITING_CONFIRMATION" | "CONFIRMED" | "REJECTED" | "ALL";

export default function PaymentsPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<PaymentStatus>("AWAITING_CONFIRMATION");
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<any>(null);
    const [rejectDialog, setRejectDialog] = useState<any>(null);
    const [rejectReason, setRejectReason] = useState("");
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery(
        orpc.adminPayment.listPendingPayments.queryOptions({})
    );

    const { mutateAsync: confirmPayment, isPending: isConfirming } = useMutation({
        mutationFn: (paymentId: string) => client.adminPayment.confirmPayment(paymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.adminPayment.listPendingPayments.queryKey({}) });
            toast.success("Payment confirmed successfully");
            setConfirmDialog(null);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to confirm payment");
        },
    });

    const { mutateAsync: rejectPayment, isPending: isRejecting } = useMutation({
        mutationFn: (data: { paymentId: string; reason: string }) =>
            client.adminPayment.rejectPayment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.adminPayment.listPendingPayments.queryKey({}) });
            toast.success("Payment rejected");
            setRejectDialog(null);
            setRejectReason("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to reject payment");
        },
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
            case "AWAITING_CONFIRMATION":
                return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Awaiting</Badge>;
            case "CONFIRMED":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
            case "REJECTED":
                return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getMethodBadge = (method: string) => {
        return method === "COD" ? (
            <Badge variant="outline">Cash on Delivery</Badge>
        ) : (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Bank Transfer</Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const filteredPayments = data?.filter((payment: any) => {
        if (statusFilter !== "ALL" && payment.status !== statusFilter) return false;
        if (search) {
            const searchLower = search.toLowerCase();
            return (
                payment.orderId.toLowerCase().includes(searchLower) ||
                payment.order?.user?.name?.toLowerCase().includes(searchLower) ||
                payment.order?.user?.email?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    }) || [];

    const statusTabs: { label: string; value: PaymentStatus }[] = [
        { label: "Awaiting", value: "AWAITING_CONFIRMATION" },
        { label: "Pending", value: "PENDING" },
        { label: "Confirmed", value: "CONFIRMED" },
        { label: "Rejected", value: "REJECTED" },
        { label: "All", value: "ALL" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
                    {statusTabs.map((tab) => (
                        <Button
                            key={tab.value}
                            variant={statusFilter === tab.value ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setStatusFilter(tab.value)}
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
                        placeholder="Search by order ID or customer..."
                        className="pl-8 w-full"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading payments...
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <EmptyState
                        title="No payments found"
                        description="No payments match your current filters."
                    />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Proof</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.map((payment: any) => (
                                <TableRow key={payment.id}>
                                    <TableCell className="font-mono text-xs">
                                        <Link
                                            href={`/dashboard/orders/${payment.orderId}` as any}
                                            className="hover:underline text-blue-600"
                                        >
                                            {payment.orderId.slice(0, 8)}...
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{payment.order?.user?.name || "N/A"}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {payment.order?.user?.email || ""}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{formatPrice(payment.amount)}</TableCell>
                                    <TableCell>{getMethodBadge(payment.method)}</TableCell>
                                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                                    <TableCell>
                                        {payment.proofImageUrl ? (
                                            <button
                                                onClick={() => setLightboxImage(payment.proofImageUrl)}
                                                className="h-10 w-10 rounded-md overflow-hidden border hover:opacity-80 transition"
                                            >
                                                <img
                                                    src={payment.proofImageUrl}
                                                    alt="Proof"
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate(payment.createdAt.toString())}
                                    </TableCell>
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
                                                {payment.proofImageUrl && (
                                                    <DropdownMenuItem onClick={() => setLightboxImage(payment.proofImageUrl)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Proof
                                                    </DropdownMenuItem>
                                                )}
                                                {payment.status === "AWAITING_CONFIRMATION" && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => setConfirmDialog(payment)}>
                                                            <Check className="mr-2 h-4 w-4" /> Confirm Payment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => setRejectDialog(payment)}
                                                        >
                                                            <X className="mr-2 h-4 w-4" /> Reject Payment
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Image Lightbox */}
            <ImageLightbox
                imageUrl={lightboxImage || ""}
                open={!!lightboxImage}
                onClose={() => setLightboxImage(null)}
                alt="Payment proof"
            />

            {/* Confirm Dialog */}
            <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to confirm this payment?
                        </DialogDescription>
                    </DialogHeader>
                    {confirmDialog && (
                        <div className="space-y-4">
                            <div className="text-sm space-y-2">
                                <p><strong>Order ID:</strong> {confirmDialog.orderId.slice(0, 8)}...</p>
                                <p><strong>Customer:</strong> {confirmDialog.order?.user?.name}</p>
                                <p><strong>Amount:</strong> {formatPrice(confirmDialog.amount)}</p>
                            </div>
                            {confirmDialog.proofImageUrl && (
                                <img
                                    src={confirmDialog.proofImageUrl}
                                    alt="Payment proof"
                                    className="max-h-40 rounded-md border"
                                />
                            )}
                            <div className="flex gap-2 justify-end">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    onClick={() => confirmPayment(confirmDialog.id)}
                                    disabled={isConfirming}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Confirm Payment
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Payment</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this payment.
                        </DialogDescription>
                    </DialogHeader>
                    {rejectDialog && (
                        <div className="space-y-4">
                            <div className="text-sm space-y-2">
                                <p><strong>Order ID:</strong> {rejectDialog.orderId.slice(0, 8)}...</p>
                                <p><strong>Customer:</strong> {rejectDialog.order?.user?.name}</p>
                                <p><strong>Amount:</strong> {formatPrice(rejectDialog.amount)}</p>
                            </div>
                            <Textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejection (min 10 characters)..."
                                rows={3}
                            />
                            <div className="flex gap-2 justify-end">
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        rejectPayment({ paymentId: rejectDialog.id, reason: rejectReason })
                                    }
                                    disabled={isRejecting || rejectReason.length < 10}
                                >
                                    {isRejecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Reject Payment
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Trash, Loader2, Package } from "lucide-react";
import { formatPrice } from "@/utils/format";
import { toast } from "sonner";
import { EmptyState } from "@/components/admin/empty-state";

interface ProductVariantsModalProps {
    productId: string;
    productName: string;
    variants: Array<{
        id: string;
        sku: string;
        size: string;
        color?: string | null;
        price: number;
        stock: number;
        isActive: boolean;
    }>;
    open: boolean;
    onClose: () => void;
}

export function ProductVariantsModal({
    productId,
    productName,
    variants,
    open,
    onClose,
}: ProductVariantsModalProps) {
    const [isAddingVariant, setIsAddingVariant] = useState(false);
    const [newVariant, setNewVariant] = useState({
        sku: "",
        size: "",
        color: "",
        price: "",
        stock: "0",
    });
    const [editingStock, setEditingStock] = useState<{ id: string; value: string } | null>(null);
    const queryClient = useQueryClient();

    const invalidateProducts = () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.products.list.queryKey({ input: {} }) });
        queryClient.invalidateQueries({ queryKey: orpc.admin.products.getById.queryKey({ input: { id: productId } }) });
        queryClient.invalidateQueries({ queryKey: orpc.admin.productVariants.list.queryKey({ input: { productId } }) });
    };

    const { mutateAsync: createVariant, isPending: isCreating } = useMutation({
        mutationFn: (data: any) => client.admin.productVariants.create(data),
        onSuccess: () => {
            invalidateProducts();
            toast.success("Variant added");
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add variant");
        },
    });

    const { mutateAsync: updateStock, isPending: isUpdatingStock } = useMutation({
        mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
            client.admin.productVariants.updateStock({ id, quantity, operation: "SET" }),
        onSuccess: () => {
            invalidateProducts();
            toast.success("Stock updated");
            setEditingStock(null);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update stock");
        },
    });

    const { mutateAsync: deleteVariant, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => client.admin.productVariants.delete({ id }),
        onSuccess: () => {
            invalidateProducts();
            toast.success("Variant deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete variant");
        },
    });

    const resetForm = () => {
        setNewVariant({ sku: "", size: "", color: "", price: "", stock: "0" });
        setIsAddingVariant(false);
    };

    const handleAddVariant = async () => {
        if (!newVariant.sku || !newVariant.size || !newVariant.price) {
            toast.error("SKU, Size, and Price are required");
            return;
        }

        await createVariant({
            productId,
            sku: newVariant.sku,
            size: newVariant.size,
            color: newVariant.color || undefined,
            price: Math.round(parseFloat(newVariant.price) * 100),
            stock: parseInt(newVariant.stock) || 0,
        });
    };

    const handleSaveStock = async (id: string) => {
        if (!editingStock) return;
        const quantity = parseInt(editingStock.value);
        if (isNaN(quantity) || quantity < 0) {
            toast.error("Invalid stock quantity");
            return;
        }
        await updateStock({ id, quantity });
    };

    const handleDeleteVariant = async (id: string) => {
        if (confirm("Delete this variant?")) {
            await deleteVariant(id);
        }
    };

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Variants: {productName}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-muted-foreground">
                        {variants.length} variant{variants.length !== 1 ? "s" : ""} · Total stock: {totalStock}
                    </div>
                    <Button
                        size="sm"
                        onClick={() => setIsAddingVariant(true)}
                        disabled={isAddingVariant}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Variant
                    </Button>
                </div>

                {isAddingVariant && (
                    <div className="border rounded-lg p-4 mb-4 bg-muted/50">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <Label className="text-xs">SKU *</Label>
                                <Input
                                    value={newVariant.sku}
                                    onChange={(e) => setNewVariant((p) => ({ ...p, sku: e.target.value.toUpperCase() }))}
                                    placeholder="SKU-001"
                                    className="h-9"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Size *</Label>
                                <Input
                                    value={newVariant.size}
                                    onChange={(e) => setNewVariant((p) => ({ ...p, size: e.target.value }))}
                                    placeholder="M, L, XL..."
                                    className="h-9"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Color (optional)</Label>
                                <Input
                                    value={newVariant.color}
                                    onChange={(e) => setNewVariant((p) => ({ ...p, color: e.target.value }))}
                                    placeholder="Black"
                                    className="h-9"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Price (₦) *</Label>
                                <Input
                                    type="number"
                                    value={newVariant.price}
                                    onChange={(e) => setNewVariant((p) => ({ ...p, price: e.target.value }))}
                                    placeholder="5000"
                                    className="h-9"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Initial Stock</Label>
                                <Input
                                    type="number"
                                    value={newVariant.stock}
                                    onChange={(e) => setNewVariant((p) => ({ ...p, stock: e.target.value }))}
                                    placeholder="0"
                                    className="h-9"
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" onClick={resetForm}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleAddVariant} disabled={isCreating}>
                                {isCreating && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                Add
                            </Button>
                        </div>
                    </div>
                )}

                {variants.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="No variants"
                        description="Add variants to manage different sizes, colors, or options."
                    />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Color</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variants.map((variant) => (
                                <TableRow key={variant.id}>
                                    <TableCell className="font-mono text-xs">{variant.sku}</TableCell>
                                    <TableCell>{variant.size}</TableCell>
                                    <TableCell>{variant.color || "-"}</TableCell>
                                    <TableCell>{formatPrice(variant.price)}</TableCell>
                                    <TableCell className="min-w-[100px]">
                                        {editingStock?.id === variant.id ? (
                                            <div className="flex gap-1">
                                                <Input
                                                    type="number"
                                                    value={editingStock.value}
                                                    onChange={(e) =>
                                                        setEditingStock({ id: variant.id, value: e.target.value })
                                                    }
                                                    className="h-7 w-16"
                                                    min="0"
                                                    autoFocus
                                                />
                                                <Button
                                                    size="sm"
                                                    className="h-7 px-2"
                                                    onClick={() => handleSaveStock(variant.id)}
                                                    disabled={isUpdatingStock}
                                                >
                                                    {isUpdatingStock ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    setEditingStock({ id: variant.id, value: variant.stock.toString() })
                                                }
                                                className="hover:underline"
                                            >
                                                {variant.stock}
                                            </button>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                            onClick={() => handleDeleteVariant(variant.id)}
                                            disabled={isDeleting}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <div className="flex justify-end mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}

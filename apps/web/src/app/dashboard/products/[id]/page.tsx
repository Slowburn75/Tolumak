"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be at least 0"),
    stock: z.coerce.number().int().min(0, "Stock must be at least 0"),
    sku: z.string().min(1, "SKU is required"),
    categoryId: z.string().min(1, "Category is required"),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
    images: z.array(z.string()).default([]),
});

type ProductFormValues = {
    name: string;
    description: string;
    price: number;
    stock: number;
    sku: string;
    categoryId: string;
    status: "DRAFT" | "ACTIVE" | "ARCHIVED";
    images: string[];
};

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: product, isLoading: productLoading } = useQuery(
        orpc.admin.products.getById.queryOptions({ input: { id } })
    );

    const { data: categories } = useQuery(orpc.category.list.queryOptions());

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            images: [],
        }
    });

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                sku: product.sku,
                categoryId: product.categoryId,
                status: product.status as any,
                images: product.images || [],
            });
        }
    }, [product, reset]);

    const statusValue = watch("status");
    const categoryIdValue = watch("categoryId");
    const images = watch("images");

    const { mutateAsync: updateProduct } = useMutation({
        mutationFn: async (data: any) => client.admin.products.update({ id, ...data }),
    });

    const onSubmit = async (data: ProductFormValues) => {
        setIsSubmitting(true);
        try {
            await updateProduct(data);
            toast.success("Product updated successfully");
            router.push("/dashboard/products");
        } catch (error: any) {
            toast.error(error.message || "Failed to update product");
        } finally {
            setIsSubmitting(false);
        }
    };

    const sortedCategories = categories ? [...categories].sort((a: any, b: any) => {
        const aName = a.parent ? `${a.parent.name} > ${a.name}` : a.name;
        const bName = b.parent ? `${b.parent.name} > ${b.name}` : b.name;
        return aName.localeCompare(bName);
    }) : [];

    if (productLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/products">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Edit Product</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card p-6 rounded-lg border shadow-sm">
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register("name")} placeholder="Product name" />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            placeholder="Product description"
                            rows={4}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (cents)</Label>
                            <Input id="price" type="number" {...register("price")} />
                            {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stock</Label>
                            <Input id="stock" type="number" {...register("stock")} />
                            {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input id="sku" {...register("sku")} placeholder="Unique identifier" />
                            {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={statusValue}
                                onValueChange={(val) => setValue("status", val as any)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="ACTIVE">Active</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            value={categoryIdValue}
                            onValueChange={(val) => setValue("categoryId", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortedCategories?.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.parent ? `${cat.parent.name} > ` : ""}{cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.categoryId && (
                            <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                        )}
                    </div>

                    <div className="grid gap-4">
                        <Label>Images</Label>
                        <FileUpload
                            value={images || []}
                            onChange={(urls) => setValue("images", urls)}
                            onRemove={(url) => setValue("images", images.filter(i => i !== url))}
                        />
                        {errors.images && <p className="text-sm text-destructive">{errors.images.message}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Link href="/dashboard/products">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

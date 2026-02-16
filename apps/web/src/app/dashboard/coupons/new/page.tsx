"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Shuffle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewCouponPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        code: "",
        type: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
        value: "",
        minOrderAmount: "",
        maxDiscount: "",
        usageLimit: "",
        perUserLimit: "",
        validFrom: "",
        validUntil: "",
        description: "",
        isActive: true,
        unlimitedUsage: false,
    });

    const { mutateAsync: createCoupon, isPending } = useMutation({
        mutationFn: (data: any) => client.admin.coupons.create(data),
        onSuccess: () => {
            toast.success("Coupon created successfully");
            router.push("/dashboard/coupons");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create coupon");
        },
    });

    const generateCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData((prev) => ({ ...prev, code }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.code.match(/^[A-Z0-9]{3,20}$/)) {
            toast.error("Code must be 3-20 uppercase alphanumeric characters");
            return;
        }

        if (!formData.validFrom || !formData.validUntil) {
            toast.error("Please set validity dates");
            return;
        }

        if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
            toast.error("Valid From must be before Valid Until");
            return;
        }

        const value = parseInt(formData.value);
        if (isNaN(value) || value <= 0) {
            toast.error("Please enter a valid discount value");
            return;
        }

        if (formData.type === "PERCENTAGE" && value > 100) {
            toast.error("Percentage cannot exceed 100");
            return;
        }

        await createCoupon({
            code: formData.code.toUpperCase(),
            type: formData.type,
            value: formData.type === "FIXED_AMOUNT" ? value * 100 : value,
            minOrderAmount: formData.minOrderAmount ? parseInt(formData.minOrderAmount) * 100 : undefined,
            maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) * 100 : undefined,
            usageLimit: formData.unlimitedUsage ? undefined : formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
            perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit) : undefined,
            validFrom: new Date(formData.validFrom).toISOString(),
            validUntil: new Date(formData.validUntil).toISOString(),
            description: formData.description || undefined,
            isActive: formData.isActive,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/coupons">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Create Coupon</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Coupon Code</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    value={formData.code}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                                    }
                                    placeholder="e.g., SUMMER20"
                                    className="font-mono uppercase"
                                    maxLength={20}
                                />
                            </div>
                            <Button type="button" variant="outline" onClick={generateCode}>
                                <Shuffle className="h-4 w-4 mr-2" /> Generate
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">3-20 characters, uppercase letters and numbers only</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Discount Type & Value</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={formData.type === "PERCENTAGE"}
                                    onChange={() => setFormData((prev) => ({ ...prev, type: "PERCENTAGE" }))}
                                    className="h-4 w-4"
                                />
                                <span>Percentage (%)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="type"
                                    checked={formData.type === "FIXED_AMOUNT"}
                                    onChange={() => setFormData((prev) => ({ ...prev, type: "FIXED_AMOUNT" }))}
                                    className="h-4 w-4"
                                />
                                <span>Fixed Amount (₦)</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Discount Value {formData.type === "PERCENTAGE" ? "(%)" : "(₦)"}</Label>
                                <Input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
                                    placeholder={formData.type === "PERCENTAGE" ? "e.g., 20" : "e.g., 5000"}
                                    min="1"
                                    max={formData.type === "PERCENTAGE" ? "100" : undefined}
                                />
                            </div>
                            {formData.type === "PERCENTAGE" && (
                                <div>
                                    <Label>Max Discount (₦) - Optional</Label>
                                    <Input
                                        type="number"
                                        value={formData.maxDiscount}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, maxDiscount: e.target.value }))}
                                        placeholder="e.g., 10000"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <Label>Minimum Order Amount (₦) - Optional</Label>
                            <Input
                                type="number"
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, minOrderAmount: e.target.value }))}
                                placeholder="e.g., 10000"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Usage Limits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="unlimited"
                                checked={formData.unlimitedUsage}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({ ...prev, unlimitedUsage: checked as boolean }))
                                }
                            />
                            <Label htmlFor="unlimited" className="cursor-pointer">Unlimited usage</Label>
                        </div>

                        {!formData.unlimitedUsage && (
                            <div>
                                <Label>Total Usage Limit</Label>
                                <Input
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, usageLimit: e.target.value }))}
                                    placeholder="e.g., 100"
                                    min="1"
                                />
                            </div>
                        )}

                        <div>
                            <Label>Per User Limit - Optional</Label>
                            <Input
                                type="number"
                                value={formData.perUserLimit}
                                onChange={(e) => setFormData((prev) => ({ ...prev, perUserLimit: e.target.value }))}
                                placeholder="e.g., 1"
                                min="1"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Validity Period</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Valid From</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.validFrom}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, validFrom: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Valid Until</Label>
                                <Input
                                    type="datetime-local"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, validUntil: e.target.value }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Additional Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Description (Admin Notes) - Optional</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Internal notes about this coupon..."
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="active"
                                checked={formData.isActive}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({ ...prev, isActive: checked as boolean }))
                                }
                            />
                            <Label htmlFor="active" className="cursor-pointer">Coupon is active</Label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Coupon
                    </Button>
                    <Link href="/dashboard/coupons">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}

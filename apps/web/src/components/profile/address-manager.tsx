"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { MapPin, Plus, Trash2, Check, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function AddressManager() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    // Auth context is handled by the parent
    const { data: addresses, isLoading } = useQuery(orpc.address.list.queryOptions({ input: undefined }));

    const createMutation = useMutation({
        ...orpc.address.create.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.address.list.queryKey() });
            toast.success("Address added successfully");
            setIsOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.message);
        }
    });

    const deleteMutation = useMutation({
        ...orpc.address.delete.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.address.list.queryKey() });
            toast.success("Address deleted");
        }
    });

    const setDefaultMutation = useMutation({
        ...orpc.address.setDefault.mutationOptions(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.address.list.queryKey() });
            toast.success("Default address updated");
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        createMutation.mutate({
            name: formData.get("name") as string,
            phone: formData.get("phone") as string,
            address: formData.get("address") as string,
            city: formData.get("city") as string,
            state: formData.get("state") as string,
            postalCode: formData.get("postalCode") as string || null,
            label: formData.get("label") as string || null,
            isDefault: formData.get("isDefault") === "on",
        });
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                    <div key={i} className="h-40 bg-stone-50 animate-pulse border border-stone-100" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
                    Saved Addresses
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-none gap-2 text-[10px] uppercase tracking-widest h-10">
                            <Plus className="h-3 w-3" />
                            Add New
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md rounded-none border-stone-100">
                        <DialogHeader>
                            <DialogTitle className="font-serif italic font-light text-2xl">Add New Address</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-[10px] uppercase tracking-widest text-stone-400">Full Name</Label>
                                    <Input id="name" name="name" required className="rounded-none border-stone-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] uppercase tracking-widest text-stone-400">Phone</Label>
                                    <Input id="phone" name="phone" required className="rounded-none border-stone-200" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-[10px] uppercase tracking-widest text-stone-400">Street Address</Label>
                                <Input id="address" name="address" required className="rounded-none border-stone-200" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-[10px] uppercase tracking-widest text-stone-400">City</Label>
                                    <Input id="city" name="city" required className="rounded-none border-stone-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state" className="text-[10px] uppercase tracking-widest text-stone-400">State</Label>
                                    <Input id="state" name="state" required className="rounded-none border-stone-200" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode" className="text-[10px] uppercase tracking-widest text-stone-400">Postal Code (Optional)</Label>
                                    <Input id="postalCode" name="postalCode" className="rounded-none border-stone-200" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="label" className="text-[10px] uppercase tracking-widest text-stone-400">Label (e.g. Home, Work)</Label>
                                    <Input id="label" name="label" placeholder="Home" className="rounded-none border-stone-200" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" id="isDefault" name="isDefault" className="h-4 w-4 border-stone-300 accent-stone-900" />
                                <Label htmlFor="isDefault" className="text-xs text-stone-600">Set as default address</Label>
                            </div>
                            <Button type="submit" disabled={createMutation.isPending} className="w-full rounded-none tracking-widest uppercase text-xs py-6 mt-4">
                                {createMutation.isPending ? "Adding..." : "Save Address"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {addresses && addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                        <Card key={addr.id} className={cn(
                            "rounded-none border-stone-100 p-6 space-y-4 hover:border-stone-300 transition-colors relative group",
                            addr.isDefault && "border-stone-900 ring-1 ring-stone-900"
                        )}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-stone-400" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-900">
                                        {addr.label || "Address"}
                                    </span>
                                    {addr.isDefault && (
                                        <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 bg-stone-900 text-white rounded-full">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {!addr.isDefault && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-stone-400 hover:text-stone-900"
                                            onClick={() => setDefaultMutation.mutate({ id: addr.id })}
                                        >
                                            <Check className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-stone-400 hover:text-red-600"
                                        onClick={() => {
                                            if (confirm("Delete this address?")) {
                                                deleteMutation.mutate({ id: addr.id });
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-stone-900">{addr.name}</p>
                                <p className="text-sm text-stone-500 font-light">{addr.address}</p>
                                <p className="text-sm text-stone-500 font-light">{addr.city}, {addr.state} {addr.postalCode}</p>
                                <p className="text-sm text-stone-500 font-light">{addr.phone}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border border-dashed border-stone-200">
                    <p className="text-sm text-stone-400 font-light italic font-serif">No saved addresses yet.</p>
                </div>
            )}
        </div>
    );
}

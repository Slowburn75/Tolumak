"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash, X, Loader2, Tag } from "lucide-react";
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
    DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/empty-state";
import { TagsInput } from "@/components/admin/tags-input";
import { toast } from "sonner";

export default function AttributesPage() {
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<any>(null);
    const [managingValues, setManagingValues] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", displayName: "", values: [] as string[] });
    const [newValues, setNewValues] = useState<string[]>([]);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery(
        orpc.admin.attributes.list.queryOptions({
            input: { search: search || undefined },
        })
    );

    const { mutateAsync: createAttribute, isPending: isCreating } = useMutation({
        mutationFn: (data: any) => client.admin.attributes.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.attributes.list.queryKey({}) });
            toast.success("Attribute created");
            setIsCreateOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create attribute");
        },
    });

    const { mutateAsync: updateAttribute, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, ...data }: any) => client.admin.attributes.update({ id, ...data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.attributes.list.queryKey({}) });
            toast.success("Attribute updated");
            setEditingAttribute(null);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update attribute");
        },
    });

    const { mutateAsync: deleteAttribute, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => client.admin.attributes.delete({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.attributes.list.queryKey({}) });
            toast.success("Attribute deleted");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete attribute");
        },
    });

    const { mutateAsync: addValues, isPending: isAddingValues } = useMutation({
        mutationFn: ({ id, values }: { id: string; values: string[] }) =>
            client.admin.attributes.addValues({ id, values }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.attributes.list.queryKey({}) });
            toast.success("Values added");
            setNewValues([]);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to add values");
        },
    });

    const { mutateAsync: removeValues } = useMutation({
        mutationFn: ({ id, values }: { id: string; values: string[] }) =>
            client.admin.attributes.removeValues({ id, values }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.admin.attributes.list.queryKey({}) });
            toast.success("Value removed");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to remove value");
        },
    });

    const resetForm = () => {
        setFormData({ name: "", displayName: "", values: [] });
    };

    const openCreate = () => {
        resetForm();
        setIsCreateOpen(true);
    };

    const openEdit = (attr: any) => {
        setFormData({
            name: attr.name,
            displayName: attr.displayName,
            values: attr.values || [],
        });
        setEditingAttribute(attr);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.match(/^[a-z_]+$/)) {
            toast.error("Name must be lowercase letters and underscores only");
            return;
        }

        if (editingAttribute) {
            await updateAttribute({
                id: editingAttribute.id,
                displayName: formData.displayName,
            });
        } else {
            await createAttribute({
                name: formData.name,
                displayName: formData.displayName,
                values: formData.values,
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure? Products using this attribute will be affected.")) {
            await deleteAttribute(id);
        }
    };

    const openManageValues = (attr: any) => {
        setManagingValues(attr);
        setNewValues([]);
    };

    const handleAddValues = async () => {
        if (newValues.length === 0) return;
        await addValues({ id: managingValues.id, values: newValues });
    };

    const handleRemoveValue = async (value: string) => {
        if (confirm(`Remove "${value}" from this attribute?`)) {
            await removeValues({ id: managingValues.id, values: [value] });
        }
    };

    const filteredAttributes = data?.filter((attr: any) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            attr.name.includes(searchLower) ||
            attr.displayName.toLowerCase().includes(searchLower)
        );
    }) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Product Attributes</h1>
                <Button onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Attribute
                </Button>
            </div>

            <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search attributes..."
                    className="pl-8 w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-lg bg-card">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading attributes...
                    </div>
                ) : filteredAttributes.length === 0 ? (
                    <EmptyState
                        icon={Tag}
                        title="No attributes found"
                        description="Create attributes to add product variations."
                        action={{ label: "Add Attribute", onClick: openCreate }}
                    />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Display Name</TableHead>
                                <TableHead>Values</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttributes.map((attr: any) => (
                                <TableRow key={attr.id}>
                                    <TableCell className="font-mono text-sm">{attr.name}</TableCell>
                                    <TableCell className="font-medium">{attr.displayName}</TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="flex flex-wrap gap-1">
                                            {attr.values?.slice(0, 5).map((v: string) => (
                                                <Badge key={v} variant="secondary" className="text-xs">
                                                    {v}
                                                </Badge>
                                            ))}
                                            {attr.values?.length > 5 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{attr.values.length - 5}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{attr._count?.products || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openManageValues(attr)}
                                            >
                                                <Tag className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(attr)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(attr.id)}
                                                disabled={isDeleting}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog
                open={isCreateOpen || !!editingAttribute}
                onOpenChange={() => {
                    setIsCreateOpen(false);
                    setEditingAttribute(null);
                    resetForm();
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingAttribute ? "Edit Attribute" : "Create Attribute"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Internal Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., size"
                                disabled={!!editingAttribute}
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Lowercase letters and underscores only
                            </p>
                        </div>
                        <div>
                            <Label>Display Name</Label>
                            <Input
                                value={formData.displayName}
                                onChange={(e) => setFormData((prev) => ({ ...prev, displayName: e.target.value }))}
                                placeholder="e.g., Size"
                            />
                        </div>
                        {!editingAttribute && (
                            <div>
                                <Label>Initial Values (optional)</Label>
                                <TagsInput
                                    value={formData.values}
                                    onChange={(values) => setFormData((prev) => ({ ...prev, values }))}
                                    placeholder="Add values..."
                                />
                            </div>
                        )}
                        <div className="flex gap-2 justify-end">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isCreating || isUpdating}>
                                {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingAttribute ? "Save Changes" : "Create"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Manage Values Dialog */}
            <Dialog open={!!managingValues} onOpenChange={() => setManagingValues(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Values: {managingValues?.displayName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {managingValues?.values?.map((v: string) => (
                                <Badge key={v} variant="secondary" className="gap-1 pr-1">
                                    {v}
                                    <button
                                        onClick={() => handleRemoveValue(v)}
                                        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div>
                            <Label>Add New Values</Label>
                            <TagsInput
                                value={newValues}
                                onChange={setNewValues}
                                placeholder="Type and press Enter..."
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button
                                onClick={handleAddValues}
                                disabled={isAddingValues || newValues.length === 0}
                            >
                                {isAddingValues && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add Values
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

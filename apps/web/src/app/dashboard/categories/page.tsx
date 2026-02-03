"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash, Loader2 } from "lucide-react";
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
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CategoriesPage() {
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newParentId, setNewParentId] = useState<string | undefined>(undefined);
    const queryClient = useQueryClient();

    const { data: categories, isLoading } = useQuery(orpc.category.list.queryOptions());

    const { mutateAsync: createCategory, isPending: isCreating } = useMutation({
        mutationFn: (data: { name: string; description?: string; parentId?: string }) =>
            client.admin.categories.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.category.list.queryKey() });
            toast.success("Category created successfully");
            setIsCreateOpen(false);
            setNewName("");
            setNewDescription("");
            setNewParentId(undefined);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create category");
        },
    });

    const { mutateAsync: deleteCategory } = useMutation({
        mutationFn: (id: string) => client.admin.categories.delete({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.category.list.queryKey() });
            toast.success("Category deleted successfully");
        },
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        await createCategory({
            name: newName,
            description: newDescription,
            parentId: newParentId === "root" ? undefined : newParentId
        });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure? This will affect products in this category.")) {
            await deleteCategory(id);
        }
    };

    const sortedCategories = categories ? [...categories].sort((a: any, b: any) => {
        const aName = a.parent ? `${a.parent.name} > ${a.name}` : a.name;
        const bName = b.parent ? `${b.parent.name} > ${b.name}` : b.name;
        return aName.localeCompare(bName);
    }) : [];

    const filteredCategories = sortedCategories?.filter((cat) =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Category name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="parent">Parent Category (Optional)</Label>
                                <select
                                    id="parent"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={newParentId || "root"}
                                    onChange={(e) => setNewParentId(e.target.value)}
                                >
                                    <option value="root">None (Root Category)</option>
                                    {categories?.filter(c => !c.parentId).map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    placeholder="Optional description"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isCreating || !newName}>
                                    {isCreating ? "Creating..." : "Create Category"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search categories..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-lg bg-card">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading categories...
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Products Count</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories?.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {(category as any).parent && (
                                            <span className="text-muted-foreground mr-1">{(category as any).parent.name} &gt;</span>
                                        )}
                                        {category.name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground max-w-xs truncate">
                                        {category.description || "—"}
                                    </TableCell>
                                    <TableCell>{(category as any)._count?.products || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-8 w-8"
                                            onClick={() => handleDelete(category.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCategories?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

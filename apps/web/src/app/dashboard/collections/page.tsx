"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Trash, Loader2, ImageIcon } from "lucide-react";
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

export default function CollectionsPage() {
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const queryClient = useQueryClient();

    const { data: collections, isLoading } = useQuery(orpc.collection.list.queryOptions());

    const { mutateAsync: createCollection, isPending: isCreating } = useMutation({
        mutationFn: (data: any) => client.admin.collections.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.collection.list.queryKey() });
            toast.success("Collection created successfully");
            setIsCreateOpen(false);
            setNewName("");
            setNewSlug("");
            setNewDescription("");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create collection");
        },
    });

    const { mutateAsync: deleteCollection } = useMutation({
        mutationFn: (id: string) => client.admin.collections.delete({ id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orpc.collection.list.queryKey() });
            toast.success("Collection deleted successfully");
        },
    });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newSlug) return;
        await createCollection({ name: newName, slug: newSlug, description: newDescription });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            await deleteCollection(id);
        }
    };

    const filteredCollections = collections?.filter((col) =>
        col.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Collection
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Collection</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={newName}
                                    onChange={(e) => {
                                        setNewName(e.target.value);
                                        if (!newSlug) {
                                            setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                                        }
                                    }}
                                    placeholder="Collection name"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={newSlug}
                                    onChange={(e) => setNewSlug(e.target.value)}
                                    placeholder="collection-slug"
                                />
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
                                <Button type="submit" disabled={isCreating || !newName || !newSlug}>
                                    {isCreating ? "Creating..." : "Create Collection"}
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
                        placeholder="Search collections..."
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
                        Loading collections...
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCollections?.map((col) => (
                                <TableRow key={col.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                            {col.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{col.slug}</TableCell>
                                    <TableCell>{(col as any)._count?.products || 0}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive h-8 w-8"
                                            onClick={() => handleDelete(col.id)}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredCollections?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No collections found.
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

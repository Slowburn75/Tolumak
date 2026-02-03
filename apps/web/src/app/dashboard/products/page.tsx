"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "@/utils/orpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, Search, Edit, Trash, MoreHorizontal, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    orpc.admin.products.list.queryOptions({
      input: {
        search: search || undefined,
        page,
        limit: 10,
      },
    }),
  );

  const { mutateAsync: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => client.admin.products.delete({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.admin.products.list.queryKey({ input: {} }) });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
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
            Loading products...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover border bg-muted"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted border flex items-center justify-center text-[10px] text-muted-foreground">
                          No Image
                        </div>
                      )}
                      <span>{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "ACTIVE"
                          ? "default"
                          : product.status === "DRAFT"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <span className={product.stock < 5 ? "text-destructive font-bold" : ""}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.category?.name || "N/A"}
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
                        <Link href={`/dashboard/products/${product.id}` as any}>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(product.id)}
                          disabled={isDeleting}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {data?.products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data?.products.length || 0} of {data?.total || 0} products (Page {data?.page} of {data?.totalPages})
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
            disabled={!data || page >= data.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

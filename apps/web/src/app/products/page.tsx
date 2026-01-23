import { ProductGrid } from "@/components/product/product-grid";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { client } from "@/utils/orpc";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : undefined;
  const collectionId = typeof params.collectionId === "string" ? params.collectionId : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const sort =
    typeof params.sort === "string" && ["price_asc", "price_desc", "newest"].includes(params.sort)
      ? (params.sort as "price_asc" | "price_desc" | "newest")
      : undefined;

  const data = await client.product.listProducts({
    categoryId,
    collectionId,
    search,
    page,
    limit: 20,
    isPublished: true,
    sort,
  });

  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="grid gap-8 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
        <aside className="hidden md:block">
          <ProductFilters />
        </aside>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <span className="text-muted-foreground text-sm">{data.total} results</span>
          </div>

          {data.products.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mb-4 text-muted-foreground">
                Try adjusting your filters or search query.
              </p>
            </div>
          ) : (
            <ProductGrid>
              {data.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    category: product.category || undefined,
                  }}
                />
              ))}
            </ProductGrid>
          )}
        </div>
      </div>
    </div>
  );
}

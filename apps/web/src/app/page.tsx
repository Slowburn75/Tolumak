import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductCard } from "@/components/product/product-card";
import { client } from "@/utils/orpc"; // Use client for server component
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Server Component
export default async function Home() {
  const [productsData, collectionsData] = await Promise.all([
    client.product.listProducts({ limit: 8, isPublished: true }), // Use isPublished
    client.collection.list({ limit: 4 }),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      {/* Featured Products */}
      <section className="container px-4 py-12 md:py-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured Products</h2>
          <Link href="/products">
            <Button variant="ghost" className="hidden sm:flex">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ProductGrid>
          {productsData.products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                ...product,
                category: product.category || undefined,
              }}
            />
          ))}
        </ProductGrid>
        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/products">
            <Button variant="outline">View All Products</Button>
          </Link>
        </div>
      </section>

      {/* Collections */}
      {collectionsData.length > 0 && (
        <section className="bg-muted/50 py-12 md:py-24">
          <div className="container px-4">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-8">
              Shop by Collection
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {collectionsData.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/products?collectionId=${collection.id}`}
                  className="group relative overflow-hidden rounded-lg bg-background aspect-[4/3] border hover:shadow-lg transition-all"
                >
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                    <h3 className="text-lg font-bold">{collection.name}</h3>
                    <p className="text-sm opacity-90">{collection._count.products} Products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

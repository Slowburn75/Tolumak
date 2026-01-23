import Image from "next/image";
import { notFound } from "next/navigation";
import { client } from "@/utils/orpc";
import { formatPrice } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const product = await client.product.getBySlug({ slug });

    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted border">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <div className="gap-2">
              <div className="text-sm text-muted-foreground mb-2">
                {product.category?.name || "Uncategorized"}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-primary">{formatPrice(product.price)}</div>
            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>

            <div className="flex flex-col gap-4 pt-6 border-t">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    In Stock ({product.stock})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-700">Out of Stock</span>
                </div>
              )}

              <AddToCartButton product={product} />
            </div>

            {/* Additional Info */}
            <div className="grid gap-4 text-sm text-muted-foreground pt-6 border-t">
              {product.weight && <div>Weight: {product.weight.toString()} kg</div>}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    // console.error(error); // Optional debug
    notFound();
  }
}

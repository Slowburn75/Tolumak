import { notFound } from "next/navigation";
import { client } from "@/utils/orpc";
import { ProductSelector } from "@/components/product/product-selector";
import { ProductImageCarousel } from "@/components/product/product-image-carousel";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ReviewList } from "@/components/reviews/review-list";
import { ReviewForm } from "@/components/reviews/review-form";
import { RelatedProducts } from "@/components/product/related-products";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ProductViewRecorder } from "@/components/product/product-view-recorder";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const product = await client.product.getBySlug({ slug });

    const breadcrumbItems = [
      { label: "Shop", href: "/products" },
      ...(product.category
        ? [{ label: product.category.name, href: `/products?categoryId=${product.categoryId}` }]
        : []),
      { label: product.name },
    ];

    return (
      <div className="container px-4 py-8 md:px-6 md:py-12">
        <ProductViewRecorder productId={product.id} />
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12 mb-20">
          {/* Gallery */}
          <ProductImageCarousel images={product.images} name={product.name} />

          <div className="flex flex-col gap-6">
            <div className="gap-2">
              <div className="text-sm text-muted-foreground mb-2">
                {product.category?.name || "Uncategorized"}
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

            </div>

            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description}</p>
            </div>

            <ProductSelector product={product} />

            {/* Additional Info */}
            <div className="grid gap-4 text-sm text-muted-foreground pt-6 border-t">
              {product.weight && <div>Weight: {product.weight.toString()} kg</div>}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-4xl mx-auto border-t border-stone-100 pt-16">
          <h2 className="text-2xl font-light italic font-serif text-stone-900 mb-12 text-center">
            Customer Reviews
          </h2>

          <div className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-7 lg:col-span-8">
              <ReviewList productId={product.id} />
            </div>
            <div className="md:col-span-5 lg:col-span-4">
              <div className="sticky top-24">
                <ReviewForm productId={product.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="border-t border-stone-100 pt-16 mb-20">
          <RelatedProducts productId={product.id} />
        </div>

        {/* Recently Viewed */}
        <div className="border-t border-stone-100 pt-16 mb-20">
          <RecentlyViewed />
        </div>
      </div>
    );
  } catch (error) {
    // console.error(error); // Optional debug
    notFound();
  }
}


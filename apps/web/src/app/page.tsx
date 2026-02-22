import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductCard } from "@/components/product/product-card";
import { client } from "@/utils/orpc";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const [productsData, collectionsData] = await Promise.all([
    client.product.listProducts({ limit: 10, isPublished: true }),
    client.collection.list({ limit: 4 }),
  ]);

  return (
    <>
      <Hero />
      {/* Features Section */}
      <section className="bg-stone-50 py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">

            {/* Item 1 */}
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm border border-stone-100 transition-transform duration-300 group-hover:-translate-y-1">
                <svg className="w-6 h-6 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10l9 4 9-4V7" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">Free Shipping</h3>
                <p className="text-stone-500 text-xs">On all orders over $99</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm border border-stone-100 transition-transform duration-300 group-hover:-translate-y-1">
                <svg className="w-6 h-6 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-3-4h6" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">30-Day Returns</h3>
                <p className="text-stone-500 text-xs">Hassle-free exchanges</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm border border-stone-100 transition-transform duration-300 group-hover:-translate-y-1">
                <svg className="w-6 h-6 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-6m0 0a4 4 0 00-4 4m4-4a4 4 0 014 4m-8 0v2m8-2v2" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">Expert Support</h3>
                <p className="text-stone-500 text-xs">Available 24/7 for you</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col items-center text-center space-y-3 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm border border-stone-100 transition-transform duration-300 group-hover:-translate-y-1">
                <svg className="w-6 h-6 text-stone-800" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">Secure Payment</h3>
                <p className="text-stone-500 text-xs">100% encryption guaranteed</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Collections */}
      {collectionsData.length > 0 && (
        <section className="bg-white border-t border-stone-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
            <div className="mb-8 md:mb-12 text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-stone-900 italic font-serif">Curated Collections</h2>
              <div className="w-16 h-[1px] bg-stone-300 mx-auto" />
              <p className="text-stone-500 max-w-lg mx-auto text-sm px-4">
                Explore our meticulously crafted selections, where contemporary design meets timeless elegance.
              </p>
            </div>

            <div className="relative">
              <div className="flex gap-8 md:gap-12 overflow-x-auto scrollbar-hide scroll-smooth pb-10 px-2 -mx-4 md:mx-0 snap-x snap-mandatory">
                {collectionsData.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/products?collectionId=${collection.id}`}
                    className="group min-w-[200px] md:min-w-[240px] flex flex-col items-center space-y-6 snap-center first:ml-4 last:mr-4 md:first:ml-0 md:last:mr-0"
                  >
                    <div className="relative w-48 h-48 md:w-56 md:h-56">
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-stone-100 transition-transform duration-700 group-hover:rotate-180" />
                      <div className="absolute inset-2 rounded-full bg-stone-50 flex items-center justify-center overflow-hidden border border-stone-100 shadow-inner">
                        {collection.image ? (
                          <img
                            src={collection.image}
                            alt={collection.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest text-stone-400">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-sm border border-stone-100 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-[10px] whitespace-nowrap uppercase tracking-widest font-bold text-stone-800">Explore</p>
                      </div>
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="text-base md:text-lg font-medium text-stone-900 group-hover:text-stone-600 transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em]">
                        {collection._count.products} Products
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Featured Products / New Arrivals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 bg-white">
        {/* Section Header */}
        <div className="mb-8 md:mb-12 text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-stone-900 italic font-serif">
            New Arrivals
          </h2>
          <div className="w-16 h-[1px] bg-stone-300 mx-auto" />
          <p className="mx-auto max-w-md text-sm text-stone-500 font-light px-4">
            A carefully curated selection of pieces, designed to redefine your seasonal wardrobe.
          </p>
        </div>

        {/* Product Grid */}
        <ProductGrid className="gap-4 md:gap-6 lg:gap-8">
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

        {/* View All */}
        <div className="mt-8 md:mt-12 text-center">
          <Link href="/products">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-none px-12 py-6 border-stone-200 text-stone-900 uppercase tracking-widest text-xs hover:bg-stone-950 hover:text-white transition-all duration-300"
            >
              Discover More
            </Button>
          </Link>
        </div>
      </section>

      {/* Top Trending */}
      <section className="border-t border-stone-100 bg-stone-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-12 md:gap-16 py-12 md:py-16 lg:py-20 lg:grid-cols-2 items-center">

          {/* LEFT PROMO */}
          <div className="relative overflow-hidden group">
            <div className="aspect-[4/5] overflow-hidden rounded-sm">
              <img
                src="/images/winter-collection.jpg"
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt="Winter Collection"
              />
            </div>

            <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/10 transition-colors duration-500" />

            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-white space-y-4">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-80">
                Seasonal Trend
              </span>

              <h2 className="text-3xl md:text-5xl font-light leading-tight italic font-serif">
                Winter Atelier <br /> For Women
              </h2>

              <Link href="/products?collection=winter" className="pt-4">
                <Button className="w-full sm:w-auto rounded-none bg-white text-stone-900 hover:bg-stone-900 hover:text-white px-8 py-6 uppercase tracking-widest text-xs transition-all duration-300">
                  Explore Selection
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT TRENDING PRODUCTS */}
          <div className="space-y-12">
            <div className="text-center lg:text-left space-y-4">
              <h2 className="text-3xl font-light italic font-serif text-stone-900">Top Trending</h2>
              <p className="text-stone-500 text-sm font-light max-w-sm">
                The most coveted pieces from our latest collection, as chosen by our global community.
              </p>
            </div>

            <div className="flex gap-10 overflow-x-auto scrollbar-hide pb-10 px-2">
              {productsData.products.slice(0, 3).map((product) => (
                <div key={product.id} className="min-w-[280px] space-y-6 group">

                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-white overflow-hidden border border-stone-100 shadow-sm">
                    {product.compareAtPrice && (
                      <span className="absolute left-4 top-4 bg-stone-900 text-white text-[9px] uppercase tracking-widest px-3 py-1 font-bold z-10">
                        Limited
                      </span>
                    )}

                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={product.name}
                    />

                    {/* Quick View Overlay (Mock) */}
                    <div className="absolute inset-0 bg-stone-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm px-6 py-3 border border-stone-100 shadow-xl">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-stone-900">Quick View</p>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="text-center lg:text-left space-y-2">
                    <h3 className="text-sm font-medium text-stone-800 group-hover:text-stone-500 transition-colors truncate">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      {product.compareAtPrice && (
                        <span className="text-xs line-through text-stone-300 font-light">
                          ${product.compareAtPrice}
                        </span>
                      )}
                      <span className="text-sm font-bold text-stone-900">
                        ${product.price}
                      </span>
                    </div>

                    {/* Sizes (subtle) */}
                    <div className="pt-2 flex justify-center lg:justify-start gap-3">
                      {["S", "M", "L"].map((s) => (
                        <span key={s} className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-stone-900">
      {/* Background Image with subtle zoom effect */}
      <div className="absolute inset-0 scale-105 animate-slow-zoom">
        <Image
          src="/hero.jpg"
          alt="Fashion collection"
          fill
          priority
          className="object-cover opacity-60"
        />
      </div>

      {/* Sophisticated Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="w-full space-y-12 animate-fade-up">
          <div className="space-y-6">
            <p className="text-[10px] md:text-xs tracking-[0.6em] text-white/60 uppercase font-bold">
              The Autumn / Winter Edition
            </p>
            <h1 className="text-5xl md:text-9xl font-light tracking-tighter text-white italic font-serif leading-[0.9]">
              Timeless <br className="hidden md:block" /> Elegance
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10">
            <Link href="/products?category=women">
              <Button
                variant="default"
                size="lg"
                className="w-full sm:w-auto bg-white text-stone-900 hover:bg-stone-100"
              >
                Shop Women
              </Button>
            </Link>

            <Link href="/products?category=men">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/20 text-white hover:bg-white hover:text-stone-900 backdrop-blur-sm"
              >
                Shop Men
              </Button>
            </Link>
          </div>

          <div className="pt-16 animate-bounce opacity-30">
            <div className="w-[1px] h-16 bg-white mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}

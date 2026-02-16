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
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
        <div className="max-w-4xl space-y-10 animate-fade-up">
          <div className="space-y-4">
            <p className="text-[10px] md:text-xs tracking-[0.5em] text-white/70 uppercase font-bold">
              The Autumn / Winter Edition
            </p>
            <h1 className="text-6xl md:text-8xl font-light tracking-tight text-white italic font-serif leading-tight">
              Timeless <br className="hidden md:block" /> Elegance
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
            <Link href="/products?category=women">
              <Button
                size="lg"
                className="rounded-none bg-white text-stone-900 hover:bg-stone-100 px-12 py-8 uppercase tracking-[0.2em] text-[10px] font-bold transition-all duration-300 shadow-xl"
              >
                Shop Women
              </Button>
            </Link>

            <Link href="/products?category=men">
              <Button
                size="lg"
                variant="outline"
                className="rounded-none border-white/30 bg-transparent text-white hover:bg-white hover:text-stone-900 px-12 py-8 uppercase tracking-[0.2em] text-[10px] font-bold transition-all duration-300 backdrop-blur-sm"
              >
                Shop Men
              </Button>
            </Link>
          </div>

          <div className="pt-12 animate-bounce opacity-50">
            <div className="w-[1px] h-12 bg-white/30 mx-auto" />
          </div>
        </div>
      </div>
    </section>
  );
}

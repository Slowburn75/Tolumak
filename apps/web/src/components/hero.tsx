import Link from "next/link";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-background py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              Premium E-Commerce Experience
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover our curated collection of high-quality products. Quality you can trust,
              prices you'll love.
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/products">
              <Button size="lg" className="h-11 px-8">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
    </div>
  );
}

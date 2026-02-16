"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Heart } from "lucide-react";
import { usePathname } from "next/navigation";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";
import { useCart } from "./cart/cart-provider";
import { cn } from "@/lib/utils";
import { SearchOverlay } from "./search-results";

export default function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  if (pathname.startsWith("/dashboard")) return null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur border-b shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="container flex h-20 items-center justify-between px-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-light tracking-[0.4em] uppercase font-serif italic text-stone-900"
          >
            Tolumak
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center space-x-12 text-[10px] uppercase tracking-[0.3em] font-bold">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                href={to as any}
                className="relative text-stone-400 transition-colors hover:text-stone-900 group"
              >
                {label}
                <span className="absolute left-0 -bottom-1 h-[1px] w-0 bg-stone-900 transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-stone-900" />
            </Button>

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="hover:bg-transparent">
                <Heart className="h-5 w-5 text-stone-900" />
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-transparent">
                <ShoppingCart className="h-5 w-5 text-stone-900" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-white text-[8px] font-bold">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <UserMenu />
            <ModeToggle />
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}


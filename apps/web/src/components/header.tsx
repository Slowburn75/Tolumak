"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";
import { useCart } from "./cart/cart-provider";

export default function Header() {
  const { itemCount } = useCart();

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">TOLUMAK</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                href={to}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile Menu Trigger would go here */}
          <div className="w-full flex-1 md:w-auto md:flex-none">{/* Search could go here */}</div>
          <nav className="flex items-center space-x-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            <UserMenu />
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export function ProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", className)}>
      {children}
    </div>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export function ProductGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5", className)}>
      {children}
    </div>
  );
}

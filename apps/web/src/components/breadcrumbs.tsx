import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                <li>
                    <Link
                        href="/"
                        className="text-stone-400 hover:text-stone-900 transition-colors flex items-center gap-1"
                    >
                        <Home className="h-3 w-3" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>

                {items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-stone-300" />
                        {item.href ? (
                            <Link
                                href={item.href as any}
                                className="text-stone-400 hover:text-stone-900 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-stone-700">{item.label}</span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

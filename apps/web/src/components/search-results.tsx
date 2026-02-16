"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Loader2 } from "lucide-react";
import { client } from "@/utils/orpc";
import { formatPrice } from "@/utils/format";
import { cn } from "@/lib/utils";

interface SearchProduct {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    category?: { name: string } | null;
}

export function SearchOverlay({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchProduct[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery("");
            setResults([]);
            setHasSearched(false);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        try {
            const data = await client.product.listProducts({
                search: searchQuery.trim(),
                limit: 6,
                isPublished: true,
            });
            setResults(data.products as SearchProduct[]);
        } catch {
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleInputChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(value), 350);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[100] bg-stone-950/60 backdrop-blur-sm animate-in fade-in-0 duration-200"
                onClick={onClose}
            />

            {/* Search Panel */}
            <div className="fixed inset-x-0 top-0 z-[101] animate-in slide-in-from-top-4 fade-in-0 duration-300">
                <div className="bg-white shadow-2xl">
                    <div className="container px-6">
                        {/* Search Input */}
                        <div className="flex items-center h-20 gap-4">
                            <Search className="h-5 w-5 text-stone-400 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Search for products..."
                                className="flex-1 bg-transparent text-lg font-light text-stone-900 placeholder:text-stone-300 outline-none tracking-wide"
                            />
                            {isLoading && (
                                <Loader2 className="h-4 w-4 text-stone-400 animate-spin shrink-0" />
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Results */}
                        {hasSearched && (
                            <div className="border-t border-stone-100 pb-8 pt-6">
                                {results.length === 0 && !isLoading ? (
                                    <div className="text-center py-12">
                                        <p className="text-stone-400 text-sm font-light">
                                            No products found for &ldquo;{query}&rdquo;
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-6">
                                            {results.length} result{results.length !== 1 ? "s" : ""}
                                        </p>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                                            {results.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/products/${product.slug}`}
                                                    onClick={onClose}
                                                    className="group space-y-3"
                                                >
                                                    <div className="relative aspect-[3/4] bg-stone-50 overflow-hidden">
                                                        <Image
                                                            src={product.images[0] || "/placeholder.png"}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-stone-400 uppercase tracking-wider">
                                                            {product.category?.name || "Uncategorized"}
                                                        </p>
                                                        <h3 className="text-sm font-medium text-stone-800 truncate group-hover:text-stone-500 transition-colors">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-sm font-bold text-stone-900">
                                                            {formatPrice(product.price)}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>

                                        {results.length >= 6 && (
                                            <div className="mt-8 text-center">
                                                <Link
                                                    href={`/products?search=${encodeURIComponent(query)}`}
                                                    onClick={onClose}
                                                    className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 hover:text-stone-900 transition-colors border-b border-stone-200 pb-1"
                                                >
                                                    View all results
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

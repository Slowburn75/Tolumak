"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageCarouselProps {
    images: string[];
    name: string;
}

export function ProductImageCarousel({ images, name }: ProductImageCarouselProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-square h-full w-full items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                No Image
            </div>
        );
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const previousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-background">
                <Image
                    src={images[currentImageIndex]}
                    alt={`${name} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    priority
                />

                {images.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full opacity-70 transition-opacity hover:opacity-100"
                            onClick={previousImage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full opacity-70 transition-opacity hover:opacity-100"
                            onClick={nextImage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            className={cn(
                                "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border transition-all hover:opacity-100",
                                currentImageIndex === index ? "ring-2 ring-primary" : "opacity-70"
                            )}
                            onClick={() => setCurrentImageIndex(index)}
                        >
                            <Image
                                src={image}
                                alt={`${name} thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

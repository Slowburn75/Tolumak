"use client";

import { useEffect, useCallback } from "react";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ImageLightboxProps {
    imageUrl: string;
    open: boolean;
    onClose: () => void;
    alt?: string;
}

export function ImageLightbox({ imageUrl, open, onClose, alt = "Image preview" }: ImageLightboxProps) {
    const [scale, setScale] = useState(1);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        },
        [onClose]
    );

    useEffect(() => {
        if (open) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open, handleKeyDown]);

    useEffect(() => {
        if (!open) {
            setScale(1);
        }
    }, [open]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        setScale((s) => Math.max(0.5, s - 0.25));
                    }}
                >
                    <ZoomOut className="h-5 w-5" />
                </Button>
                <span className="text-white text-sm min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        setScale((s) => Math.min(3, s + 0.25));
                    }}
                >
                    <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div
                className="relative max-h-[90vh] max-w-[90vw] overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={imageUrl}
                    alt={alt}
                    className="object-contain transition-transform"
                    style={{ transform: `scale(${scale})` }}
                />
            </div>
        </div>
    );
}

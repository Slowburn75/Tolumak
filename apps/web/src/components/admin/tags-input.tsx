"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagsInputProps {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function TagsInput({
    value,
    onChange,
    placeholder = "Add tag...",
    className,
    disabled = false,
}: TagsInputProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !value.includes(trimmed)) {
            onChange([...value, trimmed]);
            setInputValue("");
        }
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div
            className={cn(
                "flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 min-h-[42px]",
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
        >
            {value.map((tag, index) => (
                <Badge
                    key={`${tag}-${index}`}
                    variant="secondary"
                    className="gap-1 pr-1"
                >
                    {tag}
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </Badge>
            ))}
            <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                placeholder={value.length === 0 ? placeholder : ""}
                disabled={disabled}
                className="flex-1 min-w-[120px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
        </div>
    );
}

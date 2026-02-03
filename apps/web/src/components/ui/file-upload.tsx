"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    onRemove: (url: string) => void;
}

export function FileUpload({ value, onChange, onRemove }: FileUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map((file) => uploadToCloudinary(file));
            const urls = await Promise.all(uploadPromises);
            onChange([...value, ...urls]);
            toast.success("Images uploaded successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload images");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-wrap gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[150px] h-[150px] rounded-md overflow-hidden border">
                        <div className="z-10 absolute top-2 right-2">
                            <Button
                                type="button"
                                onClick={() => onRemove(url)}
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <img className="object-cover w-full h-full" alt="Product image" src={url} />
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 mb-4 animate-spin text-gray-500 dark:text-gray-400" />
                        ) : (
                            <UploadCloud className="w-8 h-8 mb-4 text-gray-400" />
                        )}
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            SVG, PNG, JPG or GIF (MAX. 800x400px)
                        </p>
                    </div>
                    <input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        multiple
                        accept="image/*"
                        disabled={isUploading}
                        onChange={onUpload}
                    />
                </label>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { StarRating } from "./star-rating";
import { client, orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";

const reviewSchema = z.object({
    rating: z.number().min(1, "Please select a rating").max(5),
    comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
    productId: string;
    onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
    const { data: session } = authClient.useSession();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ReviewFormValues>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
        },
    });

    const { mutateAsync: createReview } = useMutation({
        mutationFn: async (values: ReviewFormValues) => {
            return await client.review.create({
                productId,
                rating: values.rating,
                comment: values.comment,
            });
        },
        onSuccess: () => {
            toast.success("Review submitted successfully");
            form.reset();
            queryClient.invalidateQueries({
                queryKey: orpc.review.list.queryKey({ input: { productId } }),
            });
            if (onSuccess) onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to submit review");
        },
    });

    async function onSubmit(data: ReviewFormValues) {
        if (!session) {
            toast.error("Please sign in to leave a review");
            return;
        }
        setIsSubmitting(true);
        try {
            await createReview(data);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (!session) {
        return (
            <div className="bg-stone-50 p-6 rounded-lg text-center space-y-4">
                <h3 className="font-medium text-stone-900">Share your thoughts</h3>
                <p className="text-sm text-stone-500">
                    Please sign in to leave a review for this product.
                </p>
                <Button variant="outline" onClick={() => window.location.href = "/login"}>
                    Sign In
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-white border border-stone-100 p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-4 text-stone-900">Write a Review</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Rating</FormLabel>
                                <FormControl>
                                    <StarRating
                                        rating={field.value}
                                        onRatingChange={field.onChange}
                                        size={24}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Review (Optional)</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us what you liked or didn't like..."
                                        className="resize-none min-h-[100px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </form>
            </Form>
        </div>
    );
}

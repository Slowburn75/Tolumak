"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { User, MessageSquare } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { orpc } from "@/utils/orpc";
import { StarRating } from "./star-rating";

interface ReviewListProps {
    productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
    const { data, isLoading } = useQuery(orpc.review.list.queryOptions({ input: { productId } }));

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex gap-4">
                        <div className="h-10 w-10 bg-stone-100 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-stone-100 w-1/4" />
                            <div className="h-4 bg-stone-100 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const { reviews, stats } = data || {
        reviews: [],
        stats: { totalReviews: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    };

    if (stats.totalReviews === 0) {
        return (
            <div className="text-center py-12 bg-stone-50/50 rounded-lg border border-dashed border-stone-200">
                <MessageSquare className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                <h3 className="font-medium text-stone-900">No reviews yet</h3>
                <p className="text-sm text-stone-500">Be the first to share your thoughts!</p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* Summary */}
            <div className="grid md:grid-cols-2 gap-8 bg-stone-50 p-6 rounded-lg">
                <div className="text-center md:text-left space-y-2">
                    <div className="text-5xl font-bold text-stone-900">{stats.averageRating}</div>
                    <StarRating rating={stats.averageRating} size={20} readOnly />
                    <p className="text-sm text-stone-500">Based on {stats.totalReviews} reviews</p>
                </div>

                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                        const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0;
                        const percentage = (count / stats.totalReviews) * 100;
                        return (
                            <div key={rating} className="flex items-center gap-2 text-sm">
                                <span className="w-3 font-medium">{rating}</span>
                                <StarRating rating={1} size={12} readOnly className="mr-2" max={1} />
                                <Progress value={percentage} className="h-2" />
                                <span className="w-8 text-stone-500 text-xs">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-8">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-stone-100 pb-8 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarImage src={review.user.image || undefined} />
                                <AvatarFallback>
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-stone-900">{review.user.name}</h4>
                                    <span className="text-xs text-stone-400">
                                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <StarRating rating={review.rating} size={14} readOnly />
                                {review.comment && (
                                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

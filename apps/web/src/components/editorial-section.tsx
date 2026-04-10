import Link from "next/link";
import { Button } from "./ui/button";

interface EditorialSectionProps {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    reversed?: boolean;
}

export function EditorialSection({
    title,
    subtitle,
    description,
    image,
    ctaText,
    ctaLink,
    reversed = false,
}: EditorialSectionProps) {
    return (
        <section className="bg-stone-950 text-white overflow-hidden">
            <div className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} items-stretch min-h-[600px]`}>
                {/* Image side */}
                <div className="w-full md:w-1/2 relative overflow-hidden group">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-stone-900/10" />
                </div>

                {/* Text side */}
                <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-stone-950">
                    <div className="max-w-md space-y-8 animate-fade-up">
                        <div className="space-y-4">
                            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold">
                                {subtitle}
                            </span>
                            <h2 className="text-4xl md:text-6xl font-light italic font-serif leading-tight">
                                {title}
                            </h2>
                        </div>

                        <p className="text-stone-400 text-sm leading-relaxed font-light">
                            {description}
                        </p>

                        <div className="pt-6">
                            <Link href={ctaLink as any}>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="border-white/20 text-white hover:bg-white hover:text-stone-900 transition-all duration-500"
                                >
                                    {ctaText}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

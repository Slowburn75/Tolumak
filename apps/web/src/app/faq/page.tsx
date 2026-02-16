import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import type { Route } from "next";

const faqSections = [
    {
        title: "Shipping & Delivery",
        items: [
            {
                question: "How long does shipping take?",
                answer:
                    "Standard shipping takes 3-7 business days within Nigeria. Express shipping is available for 1-2 business day delivery in select cities.",
            },
            {
                question: "Do you offer free shipping?",
                answer:
                    "Yes! We offer free standard shipping on all orders over ₦50,000. Orders below this threshold have a flat shipping rate calculated at checkout.",
            },
            {
                question: "Can I track my order?",
                answer:
                    "Absolutely. Once your order ships, you'll receive a tracking number via email. You can also track your order status in real-time from your account's order history.",
            },
            {
                question: "Do you ship internationally?",
                answer:
                    "We currently ship within Nigeria only. International shipping is coming soon — follow us on social media for updates.",
            },
        ],
    },
    {
        title: "Returns & Exchanges",
        items: [
            {
                question: "What is your return policy?",
                answer:
                    "We accept returns within 7 days of delivery for items in their original condition with tags attached. Sale items are final sale and cannot be returned.",
            },
            {
                question: "How do I initiate a return?",
                answer:
                    "Contact our support team via email or WhatsApp with your order number. We'll provide instructions and a return label for eligible items.",
            },
            {
                question: "How long do refunds take?",
                answer:
                    "Refunds are processed within 3-5 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.",
            },
            {
                question: "Can I exchange an item for a different size?",
                answer:
                    "Yes, exchanges are free for different sizes of the same item, subject to availability. Contact us within 7 days of delivery.",
            },
        ],
    },
    {
        title: "Sizing & Fit",
        items: [
            {
                question: "How do I find my size?",
                answer:
                    "Each product page includes a size guide specific to that garment. We recommend measuring yourself and comparing with the chart for the best fit.",
            },
            {
                question: "Do your sizes run true to size?",
                answer:
                    "Our products are designed to be true to size. However, if you prefer a more relaxed fit, we recommend sizing up. Specific fit notes are included on each product page.",
            },
        ],
    },
    {
        title: "Payment & Security",
        items: [
            {
                question: "What payment methods do you accept?",
                answer:
                    "We accept Cash on Delivery (COD) and Bank Transfer. Additional payment options including card payments are coming soon.",
            },
            {
                question: "Is my payment information secure?",
                answer:
                    "Yes. We do not store any sensitive payment information. Bank transfer details are provided securely, and COD payments are handled at delivery.",
            },
            {
                question: "Can I use a discount code?",
                answer:
                    "Yes! Enter your coupon code at checkout in the 'Coupon Code' field and click 'Apply'. The discount will be reflected in your order total.",
            },
        ],
    },
    {
        title: "Account & Orders",
        items: [
            {
                question: "Do I need an account to place an order?",
                answer:
                    "Currently, an account is required to place an order. Creating an account allows you to track your orders and save your information for faster checkout.",
            },
            {
                question: "How do I check my order status?",
                answer:
                    "Log in to your account and visit 'My Orders' from the user menu. You can see real-time status updates for all your orders.",
            },
            {
                question: "I forgot my password. What do I do?",
                answer:
                    "Click 'Sign In' and use the forgot password link on the login page. We'll send a password reset link to your registered email.",
            },
        ],
    },
];

export default function FAQPage() {
    return (
        <div className="container px-4 py-12 md:py-20 max-w-3xl">
            {/* Header */}
            <div className="mb-16 text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-light italic font-serif text-stone-900">
                    Frequently Asked Questions
                </h1>
                <div className="w-16 h-[1px] bg-stone-300 mx-auto" />
                <p className="text-stone-500 text-sm font-light max-w-md mx-auto">
                    Everything you need to know about shopping with us. Can&apos;t find your answer?{" "}
                    <Link href={"/contact" as Route} className="underline hover:text-stone-900 transition-colors">
                        Contact us
                    </Link>
                    .
                </p>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-12">
                {faqSections.map((section) => (
                    <div key={section.title}>
                        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mb-6">
                            {section.title}
                        </h2>
                        <Accordion type="single" collapsible className="space-y-0">
                            {section.items.map((item, i) => (
                                <AccordionItem
                                    key={i}
                                    value={`${section.title}-${i}`}
                                    className="border-b border-stone-100"
                                >
                                    <AccordionTrigger className="py-5 text-sm text-left font-medium text-stone-800 hover:text-stone-600 hover:no-underline">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-stone-500 leading-relaxed pb-5">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-20 text-center border-t border-stone-100 pt-12 space-y-4">
                <h3 className="text-lg font-light italic font-serif text-stone-900">
                    Still have questions?
                </h3>
                <p className="text-sm text-stone-500">Our support team is here to help.</p>
                <Link href={"/contact" as Route}>
                    <button className="mt-4 px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-all duration-300">
                        Get In Touch
                    </button>
                </Link>
            </div>
        </div>
    );
}

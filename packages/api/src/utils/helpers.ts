export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove special characters
    .replace(/-+/g, "-") // Remove consecutive hyphens
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start/end
}

export function calculateDiscount(
  type: "PERCENTAGE" | "FIXED_AMOUNT",
  value: number,
  subtotal: number,
  maxDiscount?: number,
): number {
  let discount: number;

  if (type === "PERCENTAGE") {
    discount = Math.floor((subtotal * value) / 100);
    if (maxDiscount !== undefined && maxDiscount !== null) {
      discount = Math.min(discount, maxDiscount);
    }
  } else {
    // FIXED_AMOUNT
    discount = Math.min(value, subtotal);
  }

  return Math.max(0, Math.floor(discount)); // Always return non-negative integer
}

export function validateCouponCode(code: string): boolean {
  // 3-20 chars, alphanumeric only
  const regex = /^[A-Z0-9]{3,20}$/;
  return regex.test(code.toUpperCase());
}

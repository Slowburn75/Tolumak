import prisma from "../src/index";

async function main() {
  console.log("Seeding database...");

  // 1. Seed Top-Level Categories
  const adult = await prisma.category.upsert({
    where: { name: "Adult" },
    update: {},
    create: {
      name: "Adult",
      slug: "adult",
    },
  });

  const children = await prisma.category.upsert({
    where: { name: "Children" },
    update: {},
    create: {
      name: "Children",
      slug: "children",
    },
  });

  // 2. Seed Subcategories
  const subCategories = [
    { name: "Underwear", parentId: adult.id },
    { name: "Shirts", parentId: adult.id },
    { name: "Shoes", parentId: adult.id },
    { name: "Underwear (Kids)", parentId: children.id },
    { name: "Shirts (Kids)", parentId: children.id },
    { name: "Shoes (Kids)", parentId: children.id },
  ];

  for (const cat of subCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { parentId: cat.parentId },
      create: {
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, ""),
        parentId: cat.parentId,
      },
    });
  }

  const adultShirts = await prisma.category.findUnique({ where: { name: "Shirts" } });
  const adultShoes = await prisma.category.findUnique({ where: { name: "Shoes" } });

  console.log("Categories seeded.");

  // 3. Seed Products
  const products = [
    {
      name: "Classic White Shirt",
      slug: "classic-white-shirt",
      description: "A premium white shirt for formal occasions.",
      price: 4900, // $49.00 in cents
      stock: 100,
      categoryId: adultShirts!.id,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"],
      sku: "SHIRT-001",
    },
    {
      name: "Leather Oxford Shoes",
      slug: "leather-oxford-shoes",
      description: "Handcrafted leather shoes for men.",
      price: 12000,
      stock: 50,
      categoryId: adultShoes!.id,
      images: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&q=80&w=800"],
      sku: "SHOE-001",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log("Products seeded.");
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
  });

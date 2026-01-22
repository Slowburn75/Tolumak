import prisma from "../src/index";

async function main() {
    console.log("Seeding database...");

    // Seed Categories
    const electronics = await prisma.category.upsert({
        where: { name: "Electronics" },
        update: {},
        create: {
            name: "Electronics",
        },
    });

    const clothing = await prisma.category.upsert({
        where: { name: "Clothing" },
        update: {},
        create: {
            name: "Clothing",
        },
    });

    const home = await prisma.category.upsert({
        where: { name: "Home & Kitchen" },
        update: {},
        create: {
            name: "Home & Kitchen",
        },
    });

    console.log("Categories seeded.");

    // Seed Products
    const products = [
        {
            name: "Smartphone X",
            slug: "smartphone-x",
            description: "Latest flagship smartphone with advanced camera.",
            price: 99900, // $999.00
            stock: 50,
            categoryId: electronics.id,
            images: ["https://example.com/smartphone.jpg"],
            isPublished: true,
        },
        {
            name: "Wireless Headphones",
            slug: "wireless-headphones",
            description: "Noise-cancelling over-ear headphones.",
            price: 24999, // $249.99
            stock: 100,
            categoryId: electronics.id,
            images: ["https://example.com/headphones.jpg"],
            isPublished: true,
        },
        {
            name: "Cotton T-Shirt",
            slug: "cotton-t-shirt",
            description: "Comfortable 100% cotton t-shirt.",
            price: 1999, // $19.99
            stock: 200,
            categoryId: clothing.id,
            images: ["https://example.com/tshirt.jpg"],
            isPublished: true,
        },
        {
            name: "Denim Jeans",
            slug: "denim-jeans",
            description: "Classic blue denim jeans.",
            price: 4999, // $49.99
            stock: 150,
            categoryId: clothing.id,
            images: ["https://example.com/jeans.jpg"],
            isPublished: true,
        },
        {
            name: "Coffee Maker",
            slug: "coffee-maker",
            description: "Programmable coffee maker for your morning brew.",
            price: 7999, // $79.99
            stock: 30,
            categoryId: home.id,
            images: ["https://example.com/coffeemaker.jpg"],
            isPublished: true,
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
        // No need to disconnect manually as prisma is managed as a singleton
    });

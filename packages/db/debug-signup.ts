// debug-signup.ts
// Save to: packages/db/debug-signup.ts
// Run: bun run debug-signup.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
});

async function debugSignup() {
    try {
        console.log('🔍 Starting signup debug...\n');

        // Test 1: Check database connection
        console.log('1️⃣ Testing database connection...');
        await prisma.$connect();
        console.log('✅ Database connected\n');

        // Test 2: Check if user table exists
        console.log('2️⃣ Checking User table...');
        const userCount = await prisma.user.count();
        console.log(`✅ User table exists. Current users: ${userCount}\n`);

        // Test 3: Check if email already exists
        console.log('3️⃣ Checking if test@test.com exists...');
        const existingUser = await prisma.user.findUnique({
            where: { email: 'test@test.com' },
        });
        if (existingUser) {
            console.log('⚠️  User already exists!');
            console.log('User ID:', existingUser.id);
            console.log('Deleting existing user...\n');
            await prisma.user.delete({
                where: { email: 'test@test.com' },
            });
            console.log('✅ Deleted existing user\n');
        } else {
            console.log('✅ Email available\n');
        }

        // Test 4: Try to create user with account (like Better-Auth does)
        console.log('4️⃣ Attempting to create user with account...');
        const newUser = await prisma.user.create({
            data: {
                email: 'test@test.com',
                name: 'John Doe',
                emailVerified: false,
                accounts: {
                    create: {
                        accountId: 'test@test.com',
                        providerId: 'credential',
                        password: '$2a$10$hashedpasswordhere', // Mock hashed password
                    },
                },
            },
            include: {
                accounts: true,
            },
        });

        console.log('✅ User created successfully!');
        console.log('\nUser Details:');
        console.log(JSON.stringify(newUser, null, 2));

        // Cleanup
        console.log('\n5️⃣ Cleaning up test data...');
        await prisma.user.delete({
            where: { id: newUser.id },
        });
        console.log('✅ Test user deleted\n');

        console.log('🎉 All tests passed! Database schema is correct.\n');
        console.log('❗ If signup still fails, the issue is in Better-Auth configuration or API route.');

    } catch (error) {
        console.error('\n❌ ERROR OCCURRED:\n');

        if (error instanceof Error) {
            console.error('Error Name:', error.name);
            console.error('Error Message:', error.message);
            console.error('\nFull Error:');
            console.error(error);
        }

        console.error('\n📋 Troubleshooting:');
        console.error('1. Check if migrations ran: bunx prisma migrate status');
        console.error('2. Reset database: bunx prisma migrate reset');
        console.error('3. Check DATABASE_URL in .env file');
        console.error('4. Verify PostgreSQL is running');
    } finally {
        await prisma.$disconnect();
    }
}

debugSignup();
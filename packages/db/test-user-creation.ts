// test-user-creation.ts
// Run this with: bun run test-user-creation.ts

import prisma from './src/index';

async function testUserCreation() {
  try {
    console.log('Testing database connection...');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Try to create a user
    console.log('\nAttempting to create user...');
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        accounts: {
          create: {
            accountId: 'test-account-id',
            providerId: 'email',
            password: 'hashedpassword123', // In real app, this should be hashed
          },
        },
      },
      include: {
        accounts: true,
      },
    });

    console.log('✅ User created successfully:');
    console.log(JSON.stringify(user, null, 2));

    // Clean up - delete the test user
    console.log('\nCleaning up test data...');
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log('✅ Test user deleted');

  } catch (error) {
    console.error('❌ Error:', error);

    // More detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUserCreation();
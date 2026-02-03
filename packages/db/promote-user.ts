// promote-user.ts
// Run with: bun run promote-user.ts <email>

import prisma from './src/index';

async function promoteUser() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address.');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'admin' },
        });

        console.log(`✅ User ${email} has been promoted to 'admin'.`);
        console.log(user);
    } catch (error) {
        console.error('❌ Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

promoteUser();

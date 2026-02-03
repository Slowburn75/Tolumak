/*
  Warnings:

  - The `emailVerified` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "Role";

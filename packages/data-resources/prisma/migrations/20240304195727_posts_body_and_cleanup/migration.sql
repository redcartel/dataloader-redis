/*
  Warnings:

  - You are about to drop the `PostLike` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `body` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_repostId_fkey";

-- DropForeignKey
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_accountId_fkey";

-- DropForeignKey
ALTER TABLE "PostLike" DROP CONSTRAINT "PostLike_postId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "body" TEXT NOT NULL;

-- DropTable
DROP TABLE "PostLike";

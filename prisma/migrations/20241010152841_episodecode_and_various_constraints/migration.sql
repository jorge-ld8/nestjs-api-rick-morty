/*
  Warnings:

  - You are about to alter the column `type` on the `characters` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `episodes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `episodie_id` on the `episodes` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `subcategories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - Added the required column `episode_code` to the `episodes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "characters" ALTER COLUMN "type" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "episodes" DROP CONSTRAINT "episodes_pkey",
DROP COLUMN "episodie_id",
ADD COLUMN     "episode_code" VARCHAR(100) NOT NULL,
ADD COLUMN     "episode_id" SERIAL NOT NULL,
ADD CONSTRAINT "episodes_pkey" PRIMARY KEY ("episode_id");

-- AlterTable
ALTER TABLE "subcategories" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "categories" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "subcategories" (
    "subcategory_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "subcategories_pkey" PRIMARY KEY ("subcategory_id")
);

-- CreateTable
CREATE TABLE "episodes" (
    "episodie_id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "length" INTEGER NOT NULL,
    "airDate" TIMESTAMP(3) NOT NULL,
    "status_id" INTEGER NOT NULL,
    "season_id" INTEGER NOT NULL,

    CONSTRAINT "episodes_pkey" PRIMARY KEY ("episodie_id")
);

-- CreateTable
CREATE TABLE "characters" (
    "character_id" SERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" TEXT NOT NULL,
    "status_id" INTEGER NOT NULL,
    "specie_id" INTEGER NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("character_id")
);

-- CreateTable
CREATE TABLE "characters_episodes" (
    "character_episode_id" SERIAL NOT NULL,
    "character_id" INTEGER NOT NULL,
    "episode_id" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "characters_episodes_pkey" PRIMARY KEY ("character_episode_id")
);

-- CreateTable
CREATE TABLE "status_types" (
    "status_type_id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "status_types_pkey" PRIMARY KEY ("status_type_id")
);

-- CreateTable
CREATE TABLE "status" (
    "status_id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "status_type_id" INTEGER NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("status_id")
);

-- AddForeignKey
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "subcategories"("subcategory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_specie_id_fkey" FOREIGN KEY ("specie_id") REFERENCES "subcategories"("subcategory_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status" ADD CONSTRAINT "status_status_type_id_fkey" FOREIGN KEY ("status_type_id") REFERENCES "status_types"("status_type_id") ON DELETE RESTRICT ON UPDATE CASCADE;

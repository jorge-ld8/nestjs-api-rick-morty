import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { categories, statusTypes, statuses, subcategories } from './data';

const prisma : PrismaClient = new PrismaClient()

async function deleteAllDbRecords(){
    await prisma.status.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "status_status_id_seq" RESTART WITH 1`;
    await prisma.status_Type.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "status_types_status_type_id_seq" RESTART WITH 1`;
    await prisma.subcategory.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "subcategories_subcategory_id_seq" RESTART WITH 1`;
    await prisma.category.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "categories_category_id_seq" RESTART WITH 1`
}

async function seed() {
  try {
    await deleteAllDbRecords();

    await prisma.category.createMany(
        {
            data: categories
        }
    ); 

    // category 'Season' Id and category 'Specie' Id
    const categorySeason= await prisma.category.findFirstOrThrow({ where: {name: "Season"}});
    const categorySeasonId = categorySeason.category_id;
    const categorySpecie = await prisma.category.findFirstOrThrow({ where: {name: "Species"}});
    const categorySpecieId = categorySpecie.category_id;

    const subcats = subcategories.map((subcategory) => { 
        let id = subcategory.category === "Season" ? categorySeasonId : categorySpecieId
        return {category_id: id, name:subcategory.name};
    });

    await prisma.subcategory.createMany(
        {  
            data: subcats
        }
    );

    await prisma.status_Type.createMany(
        {
            data: statusTypes
        }
    );

    // category 'Season' Id and category 'Specie' Id
    const statusTypeCharacterId = (await prisma.status_Type.findFirstOrThrow({ where: {value: "Character"}})).status_type_id;
    const statusTypeEpisodeId = (await prisma.status_Type.findFirstOrThrow({ where: {value: "Episode"}})).status_type_id;

    const statusList = statuses.map((status) => { 
        let id = status.status_type === "Character" ? statusTypeCharacterId : statusTypeEpisodeId
        return {status_type_id: id, value: status.value};
    });    

    await prisma.status.createMany(
        {
            data: statusList
        }
    );
    console.log('Information seeded successfully.');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
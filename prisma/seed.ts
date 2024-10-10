import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { Character as CharacterAPI, Episode as EpisodeAPI} from 'rickmortyapi';

const prisma : PrismaClient = new PrismaClient()

async function deleteAllDbRecords(){
    await prisma.character.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "characters_character_id_seq" RESTART WITH 1`;
    await prisma.episode.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "episodes_episode_id_seq" RESTART WITH 1`;
    await prisma.status.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "status_status_id_seq" RESTART WITH 1`;
    await prisma.status_Type.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "status_types_status_type_id_seq" RESTART WITH 1`;
    await prisma.subcategory.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "subcategories_subcategory_id_seq" RESTART WITH 1`;
    await prisma.category.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "categories_category_id_seq" RESTART WITH 1`;
}

async function fetchAllCharacters(baseUrl: string) : Promise<CharacterAPI[]>{
    const firstResponse = await axios.get(baseUrl);
    const totalPages : number = firstResponse.data.info.pages;
    let page_num = 1
    let characters: CharacterAPI[] = [];
    do{
        const response = await axios.get(`${baseUrl}?page=${page_num}`);
        characters = characters.concat(response.data.results);
    }while(++page_num <= totalPages)

    return characters;
}

async function fetchAllEpisodes(baseUrl: string) : Promise<EpisodeAPI[]>{
    const firstResponse = await axios.get(baseUrl);
    const totalPages : number = firstResponse.data.info.pages;
    let page_num = 1
    let episodes: EpisodeAPI[] = [];
    do{
        const response = await axios.get(`${baseUrl}?page=${page_num}`);
        episodes = episodes.concat(response.data.results);
    }while(++page_num <= totalPages)

    return episodes;
}


async function seed() {
  try {
    await deleteAllDbRecords();

    const categories = [
        {name: "Season"},
        {name: "Species"}
    ]
    
    await prisma.category.createMany(
        {
            data: categories
        }
    );

    // category 'Season' Id and category 'Specie' Id
    const categorySeasonId= (await prisma.category.findFirstOrThrow({ where: {name: "Season"}})).category_id;
    const categorySpecieId = (await prisma.category.findFirstOrThrow({ where: {name: "Species"}})).category_id;

    // fetch all characters and episodes from the db 
    const characters = await fetchAllCharacters('https://rickandmortyapi.com/api/character/');
    const episodes = await fetchAllEpisodes('https://rickandmortyapi.com/api/episode/')

    // get all diferent species
    const distinctSpecies = [...new Set(characters.map(character => character.species))];
   
    let subcategories = distinctSpecies.map((specie)=>(
        {
            name: specie,
            category_id: categorySpecieId
        }
    ));

    // get all different seasons
    const distinctSeasons = [...new Set(episodes.map(episode => episode.episode.substring(1,3)))];

    subcategories = subcategories.concat(
        distinctSeasons.map((season) => (
            {
               name: "Season " + season,
               category_id: categorySeasonId
            }
        )
        )
    )

    const curr_subcategories = await prisma.subcategory.createManyAndReturn(
        {  
            data: subcategories
        }
    );

    const statusTypes = [
        {value: "Character"},
        {value: "Episode"}
    ]
    
    // seed status types 
    await prisma.status_Type.createMany(
        {
            data: statusTypes
        }
    );

    // get all different status
    const distinctStatus : string[] = [...new Set(characters.map(character => character.status))];
    const episodeStatuses = ['Cancelled', 'Active'];

    // category 'Season' Id and category 'Specie' Id
    const statusTypeCharacterId = (await prisma.status_Type.findFirstOrThrow({ where: {value: "Character"}})).status_type_id;
    const statusTypeEpisodeId = (await prisma.status_Type.findFirstOrThrow({ where: {value: "Episode"}})).status_type_id;

    let statusList = distinctStatus.map((status)=>(
        {
            status_type_id: statusTypeCharacterId,
            value: status
        }
    ));

    statusList = statusList.concat(
        episodeStatuses.map((status)=>(
            {
                status_type_id: statusTypeEpisodeId,
                value: status,
            }
        )
    )
    );

    const curr_statuses = await prisma.status.createManyAndReturn(
        {
            data: statusList
        }
    );

    // seed db characters
    await prisma.character.createMany(
        {
            data: characters.map((character) => (
                {
                    name: character.name,
                    type: character.type,
                    status_id: curr_statuses.find((status) => status.value==character.status)?.status_id ?? 1,
                    specie_id: curr_subcategories.find((specie) => specie.name==character.species)?.subcategory_id ?? 1,
                }
            )) 
        }
    );

    // seed db episodes
    await prisma.episode.createMany(
        {
            data: episodes.map((episode) => (
                {
                    name: episode.name,
                    length: 55,
                    airDate: new Date(episode.air_date),
                    status_id: curr_statuses.find((status) => status.value=='Active')?.status_id ?? 1,
                    episode_code: episode.episode,
                    season_id: curr_subcategories.find((season) => season.name.substring(season.name.length-2)===episode.episode.substring(1,3))?.subcategory_id ?? 1
                }
            ))
        }
    );
    console.log('Info seeded successfully.');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
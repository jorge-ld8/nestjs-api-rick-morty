import { Character_Episode, PrismaClient } from '@prisma/client';
import axios from 'axios';
import { start } from 'repl';
import { Character as CharacterAPI, Episode as EpisodeAPI} from 'rickmortyapi';

const prisma : PrismaClient = new PrismaClient()
const episodeLength : number = 22*60; // episode length in secs (avg 22 minutes)

function getRandomInt(min:number, max:number) {
    // Ensure min and max are integers
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function deleteAllDbRecords(){
    await prisma.character_Episode.deleteMany({});
    await prisma.$executeRaw`ALTER SEQUENCE "characters_episodes_character_episode_id_seq" RESTART WITH 1`;
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

async function seedCharacterEpisodes(episodes: EpisodeAPI[]){
    const minParticipation = 5;

    console.log('Seeding database...');
    //Initial seed with the minimun
    for(let episode of episodes){
        // divide la longitud del episodio / min
        const stepSize = Math.ceil(episodeLength / minParticipation);
        console.log(`Feeding DB with episode: ${episode.name} ${episode.id}/${episodes.length}`);

        for(let character of episode.characters){
            // get current character
            const currCharacter : CharacterAPI =  (await axios.get(character)).data;
            let character_episodes : any[] = []

            for(let startInd = 0; startInd < episodeLength; startInd+=stepSize){
                let start_time = getRandomInt(startInd, startInd + stepSize - 2);
                let end_time = getRandomInt(start_time, startInd + stepSize - 1)
                character_episodes.push({
                    start_time: start_time,
                    end_time: end_time,
                    episode_id: episode.id,
                    character_id: currCharacter.id,
                });
            }
            let char_episodes = await prisma.character_Episode.createManyAndReturn({data: character_episodes});
        }

        //check to see if each minute has a participation
        for(let startInd = 0; startInd < episodeLength; startInd+=60){
            const foundRecord = await prisma.character_Episode.findFirst({
                where: {
                    episode_id: episode.id,
                    OR:[
                        {
                            start_time: {
                                gte: startInd,
                                lte: startInd+60
                            }
                        },
                        {
                            end_time: {
                                lte: startInd+60,
                                gte: startInd
                            }
                        }
                    ]
                }
            });
            if (!foundRecord){
                // add a new record
                let charEpisode = null;
                let charId : number;
                let start_time : number;
                let end_time : number;
                do{
                    //get a random character
                    let randomCharIndex = getRandomInt(0, episode.characters.length-1);
                    const charUrl : string = episode.characters[randomCharIndex];

                    // get id of random character
                    const lastSlashIndex = charUrl.lastIndexOf('/');
                    charId = lastSlashIndex !== -1 ? +charUrl.substring(lastSlashIndex + 1) : +charUrl;

                    // let curr_char_episode : Character_Episode;
                    let start_time = getRandomInt(startInd, startInd+60-2);
                    let end_time = getRandomInt(start_time, startInd+60-1)
                    
                   charEpisode = await prisma.character_Episode.findFirst({
                        where: {
                            character_id: +charId,
                            episode_id: episode.id,
                            OR:[
                                {
                                    start_time: {
                                        gte: start_time,
                                        lte: end_time
                                    }
                                },
                                {
                                    end_time: {
                                        lte: end_time,
                                        gte: start_time
                                    }
                                }
                            ]
                        }
                    })
                }while(charEpisode);

                prisma.character_Episode.create({
                    data:{
                        episode_id: episode.id,
                        character_id: +charId,
                        start_time: start_time,
                        end_time: end_time,
                    }
                })
            }       
        }
    }
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
    let distinctStatus : string[] = [...new Set(characters.map(character => character.status))];
    distinctStatus.push("Suspended");
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
                    character_id: character.id, 
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
                    episode_id: episode.id,
                    name: episode.name,
                    length: episodeLength,
                    airDate: new Date(episode.air_date),
                    status_id: curr_statuses.find((status) => status.value=='Active')?.status_id ?? 1,
                    episode_code: episode.episode,
                    season_id: curr_subcategories.find((season) => season.name.substring(season.name.length-2)===episode.episode.substring(1,3))?.subcategory_id ?? 1
                }
            ))
        }
    );

    // seed character participations
    seedCharacterEpisodes(episodes);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
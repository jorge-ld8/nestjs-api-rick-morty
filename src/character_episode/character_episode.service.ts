import { Injectable } from '@nestjs/common';
import { CreateCharacterEpisodeDto } from './dto/create-character_episode.dto';
import { UpdateCharacterEpisodeDto } from './dto/update-character_episode.dto';

@Injectable()
export class CharacterEpisodeService {
  create(createCharacterEpisodeDto: CreateCharacterEpisodeDto) {
    return 'This action adds a new characterEpisode';
  }

  findAll() {
    return `This action returns all characterEpisode`;
  }

  findOne(id: number) {
    return `This action returns a #${id} characterEpisode`;
  }

  update(id: number, updateCharacterEpisodeDto: UpdateCharacterEpisodeDto) {
    return `This action updates a #${id} characterEpisode`;
  }

  remove(id: number) {
    return `This action removes a #${id} characterEpisode`;
  }
}

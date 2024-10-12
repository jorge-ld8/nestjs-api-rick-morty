-- AddForeignKey
ALTER TABLE "characters_episodes" ADD CONSTRAINT "characters_episodes_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("character_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters_episodes" ADD CONSTRAINT "characters_episodes_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "episodes"("episode_id") ON DELETE RESTRICT ON UPDATE CASCADE;

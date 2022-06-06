import { GuildEmoji } from "discord.js";
import { CustomClient } from "../structures/Client";

export class Emojis {

    get(client: CustomClient, emojiId: string): GuildEmoji | string {

        const emoji = client.emojis.cache.get(emojiId)
        if (!emoji) return 'NoEmojiFinded'

        return emoji
    }
}
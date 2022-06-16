import { Event } from '../../structures/Event'
import { CustomClient } from '../../structures/Client'
import { Guild } from 'discord.js'

export = class extends Event {
    constructor(client: CustomClient) {
        super(client, {
            name: 'guildCreate'
        })
    }

    run = async (guild: Guild) => {

        let array = []
        for (let i = 0; i < this.client.slashCommands.length; i++) {
            const command = this.client.slashCommands[i]
            if (command.category == "DEV") continue;
            array.push(command)
        }

        guild.commands.set(array)
    }
}
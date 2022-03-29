import { Event } from '../../structures/Event'
import { CustomClient } from '../../structures/Client'
import { Interaction } from 'discord.js'
import banSchema from '../../database/ban'

export = class extends Event {
    
    constructor(client: CustomClient) {
        super(client, {
            name: 'interactionCreate'
        })
    }

    run = async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            if (!interaction.guild) return;
            const banData = await banSchema.findOne({ userID: interaction.user.id })
            if (banData) return;

            const cmd = (<CustomClient>this.client).slashCommands.find((c: { name: string; }) => c.name === interaction.commandName)
            if (cmd) return cmd.run(interaction);
        }
    }
}
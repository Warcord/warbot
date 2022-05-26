import { Event } from '../../structures/Event'
import { CustomClient } from '../../structures/Client'
import { Interaction } from 'discord.js'
import banSchema from '../../database/ban'
import { writeLog } from '../../functions/log/write'
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
            if (banData) {
                if (banData.userID != "434353523065487360") return;
            }

            await writeLog({ message: `${interaction.user.id} has used ${interaction.commandName}`})

            const cmd = (<CustomClient>this.client).slashCommands.find((c: { name: string; }) => c.name === interaction.commandName)
            if (cmd) return cmd.run(interaction);
        }
    }
}
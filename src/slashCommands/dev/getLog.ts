import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js'
import { AllRealms } from 'warcord'
import { Emojis } from '../../functions/emojiSelector'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'log',
            description: 'Get the Log of Bot'

        }, "DEV")
    }

    run = async (interaction: CommandInteraction, config?: { activeGames?: any[], realm?: AllRealms }) => {

        if (interaction.guildId != `${process.env.GUILD_ID}` || interaction.guildId != `${process.env.DEV_ID}`) return;

        const emojis = {
            no: new Emojis().get(this.client, this.client.config.emojis.res.no)
        }

        try {
            const row = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('logs')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .setPlaceholder('Select A Log Type')
                        .addOptions([
                            {
                                label: "Commands Log",
                                emoji: "👤",
                                value: "commands"
                            },
                            {
                                label: "Errors Log",
                                emoji: "🛑",
                                value: "errors"
                            },
                            {
                                label: "Discloud Log",
                                emoji: "🔧",
                                value: "dc"
                            }
                        ])
                )

            return interaction.reply({ components: [row] })

        } catch (err: any) {
            this.client.log.errorLog(err)
            return interaction.reply({ content: `${emojis.no} | Sorry, an error ocurred.` })
        }
    }
}

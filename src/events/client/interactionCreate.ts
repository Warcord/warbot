import { Event } from '../../structures/Event'
import { CustomClient } from '../../structures/Client'
import { Interaction, MessageActionRow, MessageEmbed, MessageSelectMenu } from 'discord.js'
import banSchema from '../../database/ban'
import { writeLog } from '../../functions/log/write'
import { AllRealms } from 'warcord'
import config from '../../database/config'
import { Emojis } from '../../functions/emojiSelector'
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

        if (interaction.isButton()) {
            if (interaction.customId == "game") {

                const options = [{ name: "World of Tanks", short: "wot" }, { name: "World of WarShips", short: "wows" }, { name: "World of Tanks Console", short: "wotc" }, { name: "World of Tanks Blitz", short: "wotb" }]
                const menu = new MessageSelectMenu()
                .setCustomId(`game`)
                .setPlaceholder('Select a Game')
                .setMaxValues(options.length)
                .setMinValues(1)

                options.map(r => {
                    menu.addOptions([
                        {
                            label: `${r.name}`,
                            value: `${r.short}`
                        }
                    ])
                })

                const row = new MessageActionRow().addComponents(
                    menu
                )

                return interaction.update({ components: [row], embeds: [] })
            }

            if (interaction.customId == "realm") {
                
                const acceptedRealms = [{ name: "North America", short: "na" }, { name: "European", short: "eu" }, { name: "Russian", short: "ru" }, { name: "Asia", short: "asia" }]

                const menu = new MessageSelectMenu()
                .setCustomId(`realm`)
                .setPlaceholder('Select a Realm')
                .setMaxValues(1)
                .setMinValues(1)

                acceptedRealms.map(r => {
                    menu.addOptions([
                        {
                            label: `${r.name}`,
                            value: `${r.short}`
                        }
                    ])
                })

                const row = new MessageActionRow().addComponents(
                    menu
                )

                return interaction.update({ components: [row], embeds: [] })
            }
        }

        if (interaction.isSelectMenu()) {

            const emojis = {
                no: new Emojis().get(this.client, this.client.config.emojis.res.no),
                yes: new Emojis().get(this.client, this.client.config.emojis.res.yes),
            }

            if (interaction.customId == "game") {

                await config.findOneAndUpdate({ guildID: interaction.guild?.id }, {
                    acceptedGames: interaction.values
                })

                return interaction.update({ content: `${emojis.yes} | Configuration has been updated.`, components: [] })
            }

            if (interaction.customId == "realm") {

                await config.findOneAndUpdate({ guildID: interaction.guild?.id }, {
                    realm: interaction.values[0]
                })

                return interaction.update({ content: `${emojis.yes} | Configuration has been updated.`, components: [] })
            }
        }
    }
}
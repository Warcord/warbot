import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import { Emojis } from '../../functions/emojiSelector'
import cifg from '../../database/config'
import { AllRealms } from 'warcord'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'config',
            description: 'The bot server config.'
        }, "UTILS")
    }

    run = async (interaction: CommandInteraction, config?: { activeGames?: any[], realm?: AllRealms }) => {

        const emojis = {
            no: new Emojis().get(this.client, this.client.config.emojis.res.no),
            yes: new Emojis().get(this.client, this.client.config.emojis.res.yes),
            load: new Emojis().get(this.client, this.client.config.emojis.res.load),
            tank: new Emojis().get(this.client, this.client.config.emojis.vehicles.tank)
        }

        try {
            if (!(<any>interaction.member?.permissions).has("ADMINISTRATOR")) return interaction.reply({ content: `${emojis.no} | You don't have permission to use this command.` })

            const configData = await cifg.findOne({ guildID: interaction.guild?.id })
            if (!configData) {

                await cifg.create({
                    guildID: interaction.guild?.id,
                    realm: "com"
                })

                return interaction.reply({ content: `${emojis.yes} | The config is now ready, use the command again to edit it.` })
            }

            const realms = [{ name: "North America", short: "com" }, { name: "European", short: "eu" }, { name: "Russian", short: "ru" }, { name: "Asia", short: "asia" }]


            const embed = new MessageEmbed()
                .setTitle(`${interaction.guild?.name} Config`)
                .setThumbnail(`${interaction.guild?.iconURL()}`)
                .setColor("#ff0000")
                // .addField('Active Games', `\`\`${configData.activeGames.join('``, ``')}\`\``)
                .addField('Realm', `${realms.filter(r => r.short == configData.realm)[0].name}`)

            const row = new MessageActionRow()
                .addComponents(
                    // new MessageButton()
                    //     .setCustomId('game')
                    //     .setEmoji(`${emojis.tank}`)
                    //     .setStyle('PRIMARY')
                    //     .setLabel('Games'),
                    new MessageButton()
                        .setCustomId('realm')
                        .setEmoji(`💻`)
                        .setStyle('PRIMARY')
                        .setLabel('Realm')
                )

            return interaction.reply({ embeds: [embed], components: [row] })
        } catch (err: any) {
            this.client.log.errorLog(err)
            return interaction.reply({ content: `${emojis.no} | Sorry, an error ocurred.` })
        }
    }
}
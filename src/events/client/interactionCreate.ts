import { Event } from '../../structures/Event'
import { CustomClient } from '../../structures/Client'
import { ButtonInteraction, Interaction, Message, MessageActionRow, MessageAttachment, MessageEmbed, MessageSelectMenu } from 'discord.js'
import banSchema from '../../database/ban'
import config from '../../database/config'
import { Emojis } from '../../functions/emojiSelector'
import { create } from '../../functions/buttonGenerator'
export = class extends Event {

    constructor(client: CustomClient) {
        super(client, {
            name: 'interactionCreate'
        })
    }

    run = async (interaction: Interaction) => {

        this.client.log.susAccount(interaction)

        if (interaction.isCommand()) {
            if (!interaction.guild) return;
            const banData = await banSchema.findOne({ userID: interaction.user.id })
            if (banData) return;

            const cmd = (<CustomClient>this.client).slashCommands.find((c: { name: string; }) => c.name === interaction.commandName)
            const configData = await config.findOne({ guildID: interaction.guild.id })
            if (cmd) {
                await this.client.log.userLog(interaction)
                return cmd.run(interaction, { activeGames: configData.activeGames, realm: configData.realm });
            }
        }

        if (interaction.isButton()) {
            // if (interaction.customId == "game") {

            //     const options = [{ name: "World of Tanks", short: "wot" }, { name: "World of WarShips", short: "wows" }, { name: "World of Tanks Console", short: "wotc" }, { name: "World of Tanks Blitz", short: "wotb" }]
            //     const menu = new MessageSelectMenu()
            //     .setCustomId(`game`)
            //     .setPlaceholder('Select a Game')
            //     .setMaxValues(options.length)
            //     .setMinValues(1)

            //     options.map(r => {
            //         menu.addOptions([
            //             {
            //                 label: `${r.name}`,
            //                 value: `${r.short}`
            //             }
            //         ])
            //     })

            //     const row = new MessageActionRow().addComponents(
            //         menu
            //     )

            //     return interaction.update({ components: [row], embeds: [] })
            // }

            if (interaction.customId == "realm") {

                const acceptedRealms = [{ name: "North America", short: "com" }, { name: "European", short: "eu" }, { name: "Russian", short: "ru" }, { name: "Asia", short: "asia" }]

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

            // if (interaction.customId == "game") {

            //     await config.findOneAndUpdate({ guildID: interaction.guild?.id }, {
            //         acceptedGames: interaction.values
            //     })

            //     return interaction.update({ content: `${emojis.yes} | Configuration has been updated.`, components: [] })
            // }

            if (interaction.customId == "realm") {

                await config.findOneAndUpdate({ guildID: interaction.guild?.id }, {
                    realm: interaction.values[0]
                })

                return interaction.update({ content: `${emojis.yes} | Configuration has been updated.`, components: [] })
            }

            if (interaction.customId == "tank_menu") {

                const getTank = await this.client.warcord.wot.tank.get(interaction.values[0])
                if (!getTank) return interaction.update({ content: `${emojis.no} | No tanks found.` })

                const nation = (<string>getTank?.nation)[0].toUpperCase() + getTank.nation?.slice(1, getTank.nation.length - 1)
                const tier = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]


                const page1 = new MessageEmbed()
                    .setTitle(`${getTank?.short_name}`)
                    .setColor("#ff0000")
                    .setDescription(`${getTank.description}`)
                    .addField('Long Name', `${getTank?.name}`, true)
                    .addField('Nation', `${nation}`, true)
                    .addField('Tier', `${tier[(<number>getTank?.tier) - 1]}`, true)
                    .addField('Type', `${getTank.type?.replace('Tank', '')}`, true)
                    .setTimestamp()

                const page2 = new MessageEmbed()
                    .setTitle(`Information of ${getTank.short_name}`)
                    .setColor("#ff0000")
                    .addField(`Is Premium`, `${getTank.is_premium ? "Yes" : "No"}`, true)
                    .addField('Price Credits', `${getTank.is_premium ? "Is Premium" : getTank.price_credit}`, true)
                    .addField('Price Gold', `${getTank.is_premium ? (getTank.price_gold ? getTank.price_gold : "Null") : "Is not Premium."}`, true)
                    .addField('Wheeled', `${getTank.is_wheeled ? "Yes" : "No"}`, true)
                    .addField('Is Gift', `${getTank.is_gift ? "Yes" : "No"}`)
                    .setTimestamp()


                const page1Row = new MessageActionRow().addComponents(
                    create({ style: 'PRIMARY', customId: 'next', emoji: '➡️' })
                )

                const page2Row = new MessageActionRow().addComponents(
                    create({ style: 'PRIMARY', customId: 'prev', emoji: '⬅️' })
                )


                await interaction.update({ embeds: [page1], components: [page1Row] })

                const filter = (i: Interaction) => {
                    return i.user.id == interaction.user?.id && ["next", "prev"].includes((<ButtonInteraction>i).customId)
                }

                const collector = (<Message>interaction.message).createMessageComponentCollector({ filter, idle: 60000 })

                collector?.on('collect', async (i: ButtonInteraction) => {

                    if (i.customId == "next") {
                        return await i.update({ embeds: [page2], components: [page2Row] })
                    }

                    if (i.customId == "prev") {
                        return await i.update({ embeds: [page1], components: [page1Row] })
                    }
                });
            }

            if (interaction.customId == "logs") {

                const option = interaction.values[0]
                if (option == "dc") {

                    interaction.deferUpdate()
                    const getLog = await this.client.discloud.bot.logs(`${this.client.user?.id}`)
                    if (!getLog) return interaction.update({ content: `${emojis.no} | No data found.` })


                    const embed = new MessageEmbed()
                        .setTitle('LOGS BY DISCLOUD')
                        .setDescription(`\`\`\`js\n${getLog.logs}\`\`\``)
                        .setFooter({ text: `${getLog.link}` })

                    return interaction.update({ embeds: [embed] })
                }
                
                const file = new MessageAttachment(`src/logs/${option}.log`);
                return interaction.update({ content: `${emojis.yes} | Sucess!`, files: [file], components: [] })
            }
        }
    }
}
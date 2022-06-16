import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient, iOfSlash } from '../../structures/Client'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import pack from '../../../package.json'
import { AllRealms } from 'warcord'
import { Emojis } from '../../functions/emojiSelector'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'help',
            description: 'This help us to see all commands of the bot.',
            options: [
                {
                    name: 'command_name',
                    description: 'Name of the command.',
                    type: 'STRING',
                    required: false
                }
            ]
        }, "UTILS")
    }

    run = async (interaction: CommandInteraction, config?: { activeGames?: any[], realm?: AllRealms }) => {

        const emojis = {
            no: new Emojis().get(this.client, this.client.config.emojis.res.no)
        }

        try {
            const cmd_name = await interaction.options.getString('command_name')

            const embed = new MessageEmbed()
                .setColor('#ff0000')

            if (cmd_name) {

                const commandData = this.client.slashCommands.filter(s => s.name == cmd_name)[0]

                embed.setTitle(`Information of ${commandData.name}`)
                    .setDescription(`${commandData.description}`)
                    .addField('Category', `${commandData.category}`)

            } else {
                const commandData: {
                    wot: iOfSlash[],
                    utils: iOfSlash[]
                } = {
                    wot: [],
                    utils: []
                }
                for (const cmd of this.client.slashCommands) {
                    if (cmd.category == "WOT") commandData?.wot.push(cmd)
                    if (cmd.category == "UTILS") commandData?.utils.push(cmd)
                }

                embed.setTitle(`WarBot Commands ${pack.version}`)
                    .addField('WOT', `\`\`${commandData.wot.map(s => s.name).join('``, ``')}\`\``)
                    .addField('UTILS', `\`\`${commandData.utils.map(s => s.name).join('``, ``')}\`\``)
            }

            return interaction.reply({ embeds: [embed] })
        } catch (err: any) {
            this.client.log.errorLog(err)
            return interaction.reply({ content: `${emojis.no} | Sorry, an error ocurred.` })
        }
    }
}
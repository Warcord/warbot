import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageEmbed } from 'discord.js'

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
                    required: true
                }
            ]
        })
    }

    run = async (interaction: CommandInteraction) => {

        const cmd_name = await interaction.options.getString('command_name', true)
        if (!cmd_name) return interaction.reply({ content: 'You need put a command name to use this command!' })

        const commandData = { desc: this.description }

        const embed = new MessageEmbed()
        .setTitle(`${cmd_name}`)
        .setColor('#ff0000')
        .setDescription(`${commandData}`)

        return interaction.reply({ embeds: [embed] })
    }
}
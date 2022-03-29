import { SlashCommands } from '../../../structures/SlashCommands'
import { CustomClient } from '../../../structures/Client'
import { ColorResolvable, CommandInteraction, MessageEmbed } from 'discord.js'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wtclanm',
            description: 'Show the first 10 members of clan',
            options: [
                {
                    name: 'id',
                    description: 'The ID of clan',
                    type: 'STRING',
                    required: true
                }
            ]
        })
    }

    run = async (interaction: CommandInteraction) => {

        const clan_id = interaction.options.getString('id')
        if (clan_id) return interaction.reply({ content: `Its necessary a user ID to use this command.` })
        const clan = await this.client.warcord.wargaming.wot.clan.get(`${clan_id}`)
        if (!clan) return interaction.reply({ content: `The clan don't exist.` })

        const embed = new MessageEmbed()
        .setTitle(`Members of clan ${clan.tag}`)
        .setColor((<ColorResolvable>`${clan.color}`))

        clan.members.length = 10
        for (const i in clan.members) {

            if (parseInt(i) > clan.members.length) break;
            const member = clan.members[i]

            embed.addField(`${member.account_name}`, `\`\`ID:\`\` ${member.account_id}, \`\`Role:\`\` ${member.role_i18n}, \`\`Joined at:\`\` <t:${member.joined_at}:d>`)
        }

        return interaction.reply({ embeds: [embed] })
    }
}
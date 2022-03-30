import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageEmbed, ColorResolvable} from 'discord.js'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wtclan',
            description: 'Show the info clan',
            options: [
                {
                    name: 'idorname',
                    description: 'The ID/Name of clan',
                    type: 'STRING',
                    required: true
                }
            ]
        })
    }

    run = async (interaction: CommandInteraction) => {

        const clan_option = interaction.options.getString('idorname')
        if (!clan_option) return interaction.reply({ content: `Its necessary a user Name/ID to use this command.` })
        var clan;
        if (!isNaN(parseInt(clan_option))) {
            clan = await this.client.warcord.wargaming.wot.clan.get(clan_option)
        } else {
            const data = await this.client.warcord.wargaming.wot.clan.search(clan_option)
            clan = await this.client.warcord.wargaming.wot.clan.get(`${data[0]?.clan_id}`)
        }

        if (!clan) return interaction.reply({ content: `The clan don't exist.` })

        const embed = new MessageEmbed()
        .setTitle(`Information of Clan ${clan.tag}`)
        .setDescription(`${clan.motto}`)
        .setColor((<ColorResolvable>`${clan.color}`))
        .setThumbnail(`${clan.emblems.x195.portal}`)
        .addField('Name', `${clan.name}`, true)
        .addField('ID', `${clan.clan_id}`, true)
        .addField('Owner', `${clan.leader_name} (${clan.leader_id})`, true)
        .addField('Created At', `<t:${clan.created_at}:d>`, true)
        .addField('Members', `${clan.members.length}`, true)

        return interaction.reply({ embeds: [embed] })
    }
}
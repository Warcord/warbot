import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { AllRealms } from 'warcord'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'status',
            description: 'Get the bot status'

        }, "DEV")
    }

    run = async (interaction: CommandInteraction, config?: { activeGames?: any[], realm?: AllRealms }) => {

        if (interaction.guildId != `${process.env.GUILD_ID}` || interaction.guildId != `${process.env.DEV_ID}`) return;

        interaction.deferReply()
        const botStatus = await this.client.discloud.bot.get(`${this.client.user?.id}`)
        if (!botStatus) return interaction.reply({ content: `No data found.` })

        const embed = new MessageEmbed()
        .setTitle(`WARBOT STATUS`)
        .setThumbnail(`${this.client.user?.displayAvatarURL()}`)
        .addField('Container', `${botStatus.container}`)
        .addField('CPU', `${botStatus.cpu}`)
        .addField('RAM Memory', `${botStatus.memory}`)
        .addField('Last Restart', `${botStatus.memory}`)

        return interaction.editReply({ embeds: [embed] })
    }
}
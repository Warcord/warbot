import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { AllRealms, WOTTopTanksResolve } from 'warcord'
import { Emojis } from '../../functions/emojiSelector'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wtutank',
            description: 'Get the top tanks of User',
            options: [
                {
                    name: 'id',
                    description: 'ID of User',
                    type: 'INTEGER',
                    required: true
                }
            ]
        }, "WOT")
    }

    run = async (interaction: CommandInteraction, config?: { activeGames?: any[], realm?: AllRealms }) => {

        const id = interaction.options.getInteger('id')

        const emotes = new Emojis()
        const tanks = await this.client.warcord.wot.user.topTanks(`${id}`, { realm: config?.realm })
        if (!tanks) return interaction.reply({ content: `${emotes.get(this.client, this.client.config.emojis.res.no)} | This user has no tanks.`, ephemeral: true })
        const user = await this.client.warcord.wot.user.get(`${id}`, { realm: config?.realm })
       

        const embed = new MessageEmbed()
        .setTitle(`Top 5 Tanks of ${user?.nickname}`)
        .setColor('#ff0000')


        interaction.deferReply()
        for (let i = 0; i < (<number>tanks?.length); i++) {
            if (!tanks[i]) continue;

            const tankData = await this.client.warcord.wot.tank.get(`${(<WOTTopTanksResolve[]>tanks)[i].tank_id}`)
            const getEmoji = emotes.get(this.client, this.client.config.emojis.flags.wot[`${tankData?.nation}`])

            if (i == 0) { embed.setThumbnail(`${(<any>tankData?.images)['big_icon']}`) }
            let fieldText = `**Name:** ${tankData?.short_name}`
            getEmoji ? fieldText = `${getEmoji}` + ' ' + fieldText : ''
            embed.addField(`${i+1}. ${fieldText}`, ` ↳ **ID:** ${tankData?.tank_id} **TIER:** ${tankData?.tier}`)
        }

        return interaction.editReply({ embeds: [embed] })
    }
}
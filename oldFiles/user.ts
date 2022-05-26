import { SlashCommands } from '../src/structures/SlashCommands'
import { CustomClient } from '../src/structures/Client'
import { CommandInteraction, MessageEmbed, MessageAttachment, MessageActionRow, ButtonInteraction, Interaction } from 'discord.js'
import { create } from '../src/functions/buttonGenerator' 
import { UserSearchResolve } from 'warcord'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wtuser',
            description: 'Show user world of tanks data',
            options: [
                {
                    name: 'idorname',
                    description: 'ID/Name of User',
                    type: 'STRING',
                    required: true
                }
            ]
        })
    }

    run = async (interaction: CommandInteraction) => {

        const user_option = await interaction.options.getString('idorname')
        if (!user_option) return interaction.reply({ content: `Its necessary a user ID/Name to use this command.` })

        let user
        if (!isNaN(parseInt(user_option))) {
            user = await this.client.warcord.wot.user.get(user_option)
        } else {
            const data = await this.client.warcord.wot.user.search(user_option)
            user = await this.client.warcord.wot.user.get(`${(<UserSearchResolve[]>data)[0].account_id}`)
        }

        if (!user) return interaction.reply({ content: `This user doesn't exist.` })

        const tank = await this.client.warcord.wot.tank.get(`${user.statistics.all.max_damage_tank_id}`)
        const wins = (<number>user.statistics.all.wins) * 100 / (<number>user.statistics.all.battles)

        const file = new MessageAttachment('src/assets/icons/wot-icon.png', 'wot-icon.png')

        const page1 = new MessageEmbed()
        .setTitle(`Information of ${user.nickname}`)
        .setColor('#ff0000')
        .setThumbnail('attachment://wot-icon.png')
        .addField('ID', `${user.account_id}`, true)
        .addField('Created At', `<t:${user.created_at}:d>`, true)
        .addField('Global Rating', `${user.global_rating}`, true)
        .addField('Battles', `${user.statistics.all.battles}`, true)

        const page2 = new MessageEmbed()
        .setTitle(`Information of ${user.nickname}`)
        .setColor('#ff0000')
        .setThumbnail('attachment://wot-icon.png')
        .addField('Wins', `${user.statistics.all.wins}`, true)
        .addField('Losts', `${user.statistics.all.losses}`, true)
        .addField('Draws', `${user.statistics.all.draws}`, true)
        .addField('Avarage', `\`\`Hits:\`\` ${user.statistics.all.hits_percents}%\n\`\`XP per Battle:\`\` ${user.statistics.all.battle_avg_xp}\n\`\`Wins:\`\` ${parseFloat(`${wins}`).toFixed(2)}%\n\`\`Blocked Damage:\`\` ${user.statistics.all.avg_damage_blocked}`, true)
        .addField('Damage', `\`\`Caused:\`\` ${user.statistics.all.damage_dealt}\n\`\`Max:\`\` ${user.statistics.all.max_damage}\n\`\`Tank:\`\` ${tank?.short_name}`, true)

        const page1Row = new MessageActionRow().addComponents(
            create({ style: 'PRIMARY', customId: 'next', emoji: '➡️' })
        )

        const page2Row = new MessageActionRow().addComponents(
            create({ style: 'PRIMARY', customId: 'prev', emoji: '⬅️' })
        )

        await interaction.reply({ embeds: [page1], components: [page1Row], files: [file] })
        
        const filter = (i: Interaction) => {
            return i.user.id == interaction.user?.id && ["next", "prev"].includes((<ButtonInteraction>i).customId)
        }

        const collector = (<Interaction>interaction).channel?.createMessageComponentCollector({ filter, idle: 60000 })

        collector?.on('collect', async (i: ButtonInteraction) => {

            if (i.customId == "next") {
                return await i.update({ embeds: [page2], components: [page2Row], files: [file] })
            }

            if (i.customId == "prev") {
                return await i.update({ embeds: [page1], components: [page1Row], files: [file] })
            }
        })
    }
}
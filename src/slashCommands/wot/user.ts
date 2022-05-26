import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { ButtonInteraction, CommandInteraction, Interaction, MessageActionRow, MessageAttachment, MessageEmbed } from 'discord.js'
import { Emojis } from '../../functions/emojiSelector'
import { UserSearchResolve } from 'warcord'
import { create } from '../../functions/buttonGenerator'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wtuser',
            description: 'Get an User by ID or Name',
            options: [
                {
                    name: 'id',
                    description: 'ID of User',
                    type: 'INTEGER',
                },
                {
                    name: 'name',
                    description: 'Name of User',
                    type: 'STRING'
                }
            ]
        })
    }

    run = async (interaction: CommandInteraction) => {

        const id = interaction.options.getInteger('id')
        const name = interaction.options.getString('name')

        const emojis = {

            no: new Emojis().get(this.client, this.client.config.emojis.res.no),
            yes: new Emojis().get(this.client, this.client.config.emojis.res.yes)
        }

        if (id && name) return interaction.reply({ content: `${emojis.no} | You can't search a user with a **Name** and **ID**.` })
        if (!id && !name) return interaction.reply({ content: `${emojis.no} | You can't search a user without a **Name** and **ID**.` })

        let toSearch;
        id ? toSearch = { d: () => { return id; } } : toSearch = { d: async() => { const search = await this.client.warcord.wot.user.search(`${name}`); return (<UserSearchResolve[]>search)[0].account_id; } }
    
        const user = await this.client.warcord.wot.user.get(`${await toSearch.d()}`)
        const tank = await this.client.warcord.wot.tank.get(`${user?.statistics.all.max_damage_tank_id}`)
        const wins = (<number>user?.statistics.all.wins) * 100 / (<number>user?.statistics.all.battles)

        const file = new MessageAttachment('src/assets/icons/wot-icon.png', 'wot-icon.png')
        
        if (!user) return interaction.reply({ content: `${emojis.no} | No User's found.` })

        const page1 = new MessageEmbed()
        .setTitle(`UserInfo of ${user.nickname}`)
        .setColor('#ff0000')
        .setThumbnail('attachment://wot-icon.png')
        .addField('ID', `${user.account_id}`, true)
        .addField('Created At', `<t:${user.created_at}:d>`, true)
        .addField('Global Rating', `${user.global_rating}`, true)
        .addField('Battles', `${user.statistics.all.battles}`, true)

        const page2 = new MessageEmbed()
        .setTitle(`UserInfo of ${user.nickname}`)
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
        });
    }
}
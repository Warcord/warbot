import { SlashCommands } from '../../../structures/SlashCommands'
import { CustomClient } from '../../../structures/Client'
import { CommandInteraction, MessageEmbed, MessageAttachment, MessageActionRow, ButtonInteraction, Interaction } from 'discord.js'
import { create } from '../../../functions/buttonGenerator' 

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wotuser',
            description: 'Show user world of tanks data',
            options: [
                {
                    name: 'id',
                    description: 'ID of User',
                    type: 'STRING',
                    required: true
                }
            ]
        })
    }

    run = async (interaction: CommandInteraction) => {

        const user_id = await interaction.options.getString('id')
        if (!user_id) return interaction.reply({ content: `Its necessary a user ID to use this command.` })

        const user = await this.client.warcord.wargaming.wot.user.get(user_id)
        if (!user) return interaction.reply({ content: `This user doesn't exist.` })

        const tank = await this.client.warcord.wargaming.wot.tank.get(`${user.statistics.all.max_damage_tank_id}`)
        const wins = (<number>user.statistics.all.wins) * 100 / (<number>user.statistics.all.battles)

        const file = new MessageAttachment('src/assets/icons/wot-icon.png', 'wot-icon.png')

        const page1 = new MessageEmbed()
        .setTitle(`Informações de ${user.nickname}`)
        .setColor('#ff0000')
        .setThumbnail('attachment://wot-icon.png')
        .addField('ID', `${user.account_id}`, true)
        .addField('Criou a conta em', `<t:${user.created_at}:d>`, true)
        .addField('Avaliação Global', `${user.global_rating}`, true)
        .addField('Batalhas', `${user.statistics.all.battles}`, true)

        const page2 = new MessageEmbed()
        .setTitle(`Informações de ${user.nickname}`)
        .setColor('#ff0000')
        .setThumbnail('attachment://wot-icon.png')
        .addField('Vitórias', `${user.statistics.all.wins}`, true)
        .addField('Derrotas', `${user.statistics.all.losses}`, true)
        .addField('Empates', `${user.statistics.all.draws}`, true)
        .addField('Médias', `\`\`Acertos:\`\` ${user.statistics.all.hits_percents}%\n\`\`Experiência por Batalha:\`\` ${user.statistics.all.battle_avg_xp}\n\`\`Vitórias:\`\` ${parseFloat(`${wins}`).toFixed(2)}%\n\`\`Dano Bloqueado:\`\` ${user.statistics.all.avg_damage_blocked}`, true)
        .addField('Dano', `\`\`Causado:\`\` ${user.statistics.all.damage_dealt}\n\`\`Máximo:\`\` ${user.statistics.all.max_damage}\n\`\`Tanque:\`\` ${tank?.short_name}`, true)

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
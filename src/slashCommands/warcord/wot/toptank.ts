import { SlashCommands } from '../../../structures/SlashCommands'
import { CustomClient } from '../../../structures/Client'
import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js'
import { WOTTopTanksResolve } from 'warcord'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wttanks',
            description: 'Show the first 9 tanks of user',
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

        const user_id = interaction.options.getString('id')
        if (user_id) return interaction.reply({ content: `Its necessary a user ID to use this command.` })
        const user = await this.client.warcord.wargaming.wot.user.get(`${user_id}`)

        const garage = await this.client.warcord.wargaming.wot.user.topTanks(`${user?.account_id}`)
        const file = new MessageAttachment('src/assets/icons/wot-icon.png', 'wot-icon.png')

        const embed = new MessageEmbed()
            .setTitle(`Top 5 tanks of ${user?.nickname}`)
            .setColor('#ff0000')
            .setThumbnail('attachment://wot-icon.png');

        (<WOTTopTanksResolve[]>garage).length = 5;
        for (const i in garage) {

            if (parseInt(i) > garage.length) break;

            const tank = await this.client.warcord.wargaming.wot.tank.get(garage[parseInt(i)].tank_id)
            const status = garage[parseInt(i)].statistics
            embed.addField(`${parseInt(i)+1}. ${tank?.short_name}`, `\`\`Battles:\`\` ${status.battles}, \`\`Wins:\`\` ${status.wins}, \`\`Mark of Mastery:\`\` ${garage[parseInt(i)].mark_of_mastery}, \`\`ID:\`\` ${garage[parseInt(i)].tank_id}`)
            continue;
        }

        return interaction.reply({ embeds: [embed], files: [file] })
    }
}
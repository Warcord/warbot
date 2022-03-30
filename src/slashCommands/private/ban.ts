import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageEmbed, TextChannel } from 'discord.js'
import axios from 'axios'
import banSchema from '../../database/ban'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'ban',
            description: 'Ban a user from the bot',
            options: [
                {
                    name: 'user_id',
                    description: 'The ID of User',
                    type: 'STRING',
                    required: true
                },
                {
                    name: 'reason',
                    description: 'The reason of the Ban',
                    type: 'STRING',
                    required: false
                }
            ]
        })
    }

    run = async (interaction: CommandInteraction) => {

        const user_id = interaction.options.getString('user_id')
        let reason = interaction.options.getString('reason')

        if (!user_id) return interaction.reply({ content: `Its necessary you put a User ID to use this command.` })
        if (!reason) {
            reason = 'No reason.'
        }

        const embed = new MessageEmbed()
        .setTitle(`📌 BAN LOG 📌`)
        .setColor('#ff0000')
        .addField('Author', `${interaction.member} (${interaction.user.id})`)
        .addField('User', `${this.client.users.cache.get(`${user_id}`)?.tag} (${user_id})`)
        .addField('Reason', `${reason}`)

        const banData = await banSchema.findOne({ userID: user_id })
        if (banData) return interaction.reply({ content: 'The user its banned.' })
        await banSchema.create({ userID: user_id, authorID: interaction.user.id, reason })

        const webhooks = await (await <TextChannel>this.client.channels.cache.get(`${process.env.BAN_LOG}`))?.fetchWebhooks();
		const webhook = webhooks.find(wh => wh.token == `${process.env.BAN_HOOK}`);

        await webhook?.send({ embeds: [embed] })

        return interaction.reply({ content: 'The user has been banned with sucess!' })
    }
}
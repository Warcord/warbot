import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageEmbed } from 'discord.js'
import { AllRealms } from 'warcord'
import { Emojis } from '../../functions/emojiSelector'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wtcmember',
            description: 'Get a clan member.',
            options: [
                {
                    name: "member_id",
                    description: 'ID of Member',
                    type: "INTEGER",
                    required: true
                }
            ]
        }, "WOT")
    }

    run = async (interaction: CommandInteraction, config?: { activeGames?: any[], realm?: AllRealms }) => {

        const emojis = {
            no: new Emojis().get(this.client, this.client.config.emojis.res.no),
            yes: new Emojis().get(this.client, this.client.config.emojis.res.yes)
        }

        try {

            const memberID = interaction.options.getInteger("member_id")
            if (!memberID) return;

            const getMember = await this.client.warcord.wot.clan.member(memberID, { realm: config?.realm })
            if (!getMember) return interaction.reply({ content: `${emojis.no} | No members found.`, ephemeral: true })
            if (!getMember.clan) return interaction.reply({ content: `${emojis.no} | This user is not on a clan.`, ephemeral: true })

            const member = new MessageEmbed()
                .setTitle(`${getMember.account_name} of ${getMember.clan?.name} [${getMember.clan?.tag}]`)
                .setThumbnail(`${getMember.clan?.emblems['x256'] ? getMember.clan?.emblems.x256[Object.keys(getMember.clan?.emblems.x256)[0]] : getMember.clan?.emblems['x195'][Object.keys(getMember.clan?.emblems['x195'])[0]]}`)
                //@ts-ignore
                .setColor(`${getMember.clan?.color}`)
                .addField('Role', `${getMember.role_i18n}`)
                .addField('Joined At', `<t:${getMember.joined_at}:F>`)
                .addField('Clan ID', `${getMember.clan?.clan_id}`)

            return interaction.reply({ embeds: [member] })
        } catch (err: any) {
            this.client.log.errorLog(err)
            return interaction.reply({ content: `${emojis.no} | Sorry, an error ocurred.` })
        }
    }
}
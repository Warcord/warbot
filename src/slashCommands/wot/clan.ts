import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { ButtonInteraction, CommandInteraction, Interaction, Message, MessageActionRow, MessageEmbed } from 'discord.js'
import { AllRealms, WOTClanSearchResolve } from 'warcord'
import { Emojis } from '../../functions/emojiSelector'
import { create } from '../../functions/buttonGenerator'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wtclan',
            description: 'Get a Clan by ID or Name',
            options: [
                {
                    name: 'name_or_tag',
                    description: 'Name/Tag of Clan',
                    type: 'STRING',
                    required: false
                },
                {
                    name: 'id',
                    description: 'ID of Clan',
                    type: 'INTEGER',
                    required: false
                }
            ]
        }, "WOT")
    }

    run = async (interaction: CommandInteraction, config?: { activeGames?: any[], realm?: AllRealms }) => {


        const name = await interaction.options.getString('name_or_tag')
        const id = await interaction.options.getInteger('id')

        const emojis = {
            no: new Emojis().get(this.client, this.client.config.emojis.res.no),
            yes: new Emojis().get(this.client, this.client.config.emojis.res.yes)
        }

        try {

            if (id && name) return interaction.reply({ content: `${emojis.no} | You can't search a clan with a **Name** and **ID**.`, ephemeral: true })
            if (!id && !name) return interaction.reply({ content: `${emojis.no} | You can't search a clan without a **Name** or **ID**.`, ephemeral: true })

            let toSearch;
            id ? toSearch = { d: () => { return id; } } : toSearch = { d: async () => { const search = await this.client.warcord.wot.clan.search(`${name}`, { realm: config?.realm }); return (<WOTClanSearchResolve[]>search)[0].clan_id; } }

            interaction.deferReply()
            const clan = await this.client.warcord.wot.clan.get(`${await toSearch.d()}`, { realm: config?.realm })
            if (!clan || (<any>clan).code) return interaction.editReply({ content: `${emojis.no} | No clans found.` })

            let embedDesc = `
        **Clan ID:** ${clan.clan_id}

        **Creator:** ${clan.creator_name} **ID:** ${clan.creator_id}
        **Leader:** ${clan.leader_name} **ID:** ${clan.leader_id}
        
        **Total Members:** ${clan.members_count}
        **Accept Join Requests:** ${clan.accepts_join_requests ? "Yes" : "No"}
        
        **Created At:** <t:${clan.created_at}:F>

        **Motto:** ${clan.motto}`

            clan.old_name ? embedDesc += `\n**Old Name:** ${clan.old_name}` : ''
            clan.old_tag ? embedDesc += `\n**Old Tag:** ${clan.old_tag}` : ''

            const page1 = new MessageEmbed()
                .setTitle(`${clan.name} [${clan.tag}]`)
                .setThumbnail(`${clan.emblems['x256'] ? clan.emblems.x256[Object.keys(clan.emblems.x256)[0]] : clan.emblems['x195'][Object.keys(clan.emblems['x195'])[0]]}`)
                //@ts-ignore
                .setColor(`${clan.color}`)
                .setDescription(`${embedDesc}`)
                .setFooter({ text: `${clan.description}` })
                .setTimestamp()


            const page1Row = new MessageActionRow().addComponents(
                create({ style: 'PRIMARY', customId: 'next', emoji: '➡️' })
            )

            const page2Row = new MessageActionRow().addComponents(
                create({ style: 'PRIMARY', customId: 'prev', emoji: '⬅️' })
            )

            clan.members.length > 30 ? clan.members.length = 30 : ""

            const page2 = new MessageEmbed()
                .setTitle(`Member of Clan ${clan.name} [${clan.tag}]`)
                .addField('Members', `\`\`${clan.members.map(r => { if (!r) return; return r.account_name }).join('``, ``')}\`\`.`)
                //@ts-ignore
                .setColor(`${clan.color}`)
                .setTimestamp()


            const m = await interaction.editReply({ embeds: [page1], components: [page1Row] })

            const filter = (i: Interaction) => {
                return i.user.id == interaction.user?.id && ["next", "prev"].includes((<ButtonInteraction>i).customId)
            }

            const collector = (<Message>m).createMessageComponentCollector({ filter, idle: 60000 })

            collector?.on('collect', async (i: ButtonInteraction) => {

                if (i.customId == "next") {
                    return await i.update({ embeds: [page2], components: [page2Row] })
                }

                if (i.customId == "prev") {
                    return await i.update({ embeds: [page1], components: [page1Row] })
                }
            });

        } catch (err: any) {
            this.client.log.errorLog(err)
            return interaction.reply({ content: `${emojis.no} | Sorry, an error ocurred.` })
        }
    }
}
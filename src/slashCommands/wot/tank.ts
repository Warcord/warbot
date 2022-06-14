import { SlashCommands } from '../../structures/SlashCommands'
import { CustomClient } from '../../structures/Client'
import { CommandInteraction, MessageActionRow, MessageSelectMenu } from 'discord.js'
import { AllRealms, WOTTanksResolve } from 'warcord'
import { Emojis } from '../../functions/emojiSelector'
import { WOTNations, WOTTankTypes } from 'warcord/packages/wargaming/world-of-tanks/src/functions/tank'

export = class extends SlashCommands {
    constructor(client: CustomClient) {
        super(client, {

            name: 'wttank',
            description: 'Get first 25 tanks by params',
            options: [
                {
                    name: 'type',
                    description: 'Type of Tank (heavy, AT-SPG, medium, light, SPG)',
                    type: 'STRING',
                    required: false
                },
                {
                    name: 'nation',
                    description: 'Nation of Tank (japan, germany, sweden, poland, czech, usa, france, ussr, uk, china, italy)',
                    type: 'STRING',
                    required: false
                },
                {
                    name: 'tier',
                    description: 'Tier of Tank (Use Numbers)',
                    type: 'INTEGER',
                    required: false
                },
            ]
        }, "WOT")
    }

    run = async (interaction: CommandInteraction, config?: { activeGames?: any[], realm?: AllRealms }) => {

        const emojis = {
            no: new Emojis().get(this.client, this.client.config.emojis.res.no),
            yes: new Emojis().get(this.client, this.client.config.emojis.res.yes)
        }

        try {

            const type = interaction.options.getString('type')
            const nation = interaction.options.getString('nation')
            const tier = interaction.options.getInteger('tier')
            if (!type && !nation && !tier) return interaction.reply({ content: `${emojis.no} | You can't search a tank without a option.`, ephemeral: true });

            const validTypes1 = ["heavy", "medium", "light"]
            const validTypes2 = ["AT-SPG", "SPG"]
            if (type && (!validTypes1.includes(type) || !validTypes2.includes(type))) return interaction.reply({ content: `${emojis.no} | Invalid type!`, ephemeral: true })

            const validNations = ["japan", "germany", "sweden", "poland", "czech", "usa", "france", "ussr", "uk", "china", "italy"]
            if (nation && !validNations.includes(nation)) return interaction.reply({ content: `${emojis.no} | Invalid Nation!`, ephemeral: true })

            if (tier && (tier < 1 || tier > 10)) return interaction.reply({ content: `${emojis.no} | Invalid Tier!` })

            interaction.deferReply()
            const getTanks = await this.client.warcord.wot.tank.find((validTypes1.includes((<string>type)) ? type + "Tank" : type) as WOTTankTypes, (<WOTNations>nation), (<number>tier), { limit: 25, realm: config?.realm })
            if (!getTanks) return interaction.reply({ content: `${emojis.no} | No tanks found.` })


            const menu = new MessageSelectMenu()
                .setCustomId('tank_menu')
                .setPlaceholder('Select a Tank')
                .setMaxValues(1)
                .setMinValues(1)


            const array: WOTTanksResolve[] = []
            //@ts-ignore
            Object.keys(getTanks).map(k => array.push(getTanks[k]));
            array.length = 25;

            (<WOTTanksResolve[]>array).map((tank) => {
                menu.addOptions([
                    {
                        label: `${tank.short_name}`,
                        value: `${tank.tank_id}`
                    }
                ])
            })

            const row = new MessageActionRow().addComponents(menu)

            return interaction.editReply({ components: [row] })

        } catch (err: any) {
            this.client.log.errorLog(err)
            return interaction.reply({ content: `${emojis.no} | Sorry, an error ocurred.` })
        }
    }
}
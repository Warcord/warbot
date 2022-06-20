import { readdirSync } from "fs";
import { join } from "path";

import { WarCord, AllRealms } from 'warcord'
import { Client, Interaction, ClientOptions, Guild } from 'discord.js';
import { connect } from 'mongoose';
import config from '../../config.json'
import { WarLog } from '../functions/warlog'
import { DiscloudAPI } from "discloud-api";

interface iOfSlash {
    name: string;
    description: string;
    category: string;
    run(interaction: Interaction, config?: { activeGames?: any[], realm?: AllRealms }): Promise<void>
}

class CustomClient extends Client {

    slashCommands: iOfSlash[];
    pvSlashCommands: iOfSlash[];
    warcord: WarCord
    config: any;
    log: WarLog
    discloud: DiscloudAPI;

    constructor(options: ClientOptions) {
        super(options)

        this.config = config
        this.slashCommands = [];
        this.pvSlashCommands = [];
        this.loadSlashCommands()
        this.loadEvents()
        this.warcord = new WarCord(`${process.env.APP_ID}`)
        this.log = new WarLog()
        this.discloud = new DiscloudAPI(`${process.env.DC_TOKEN}`)
    }

    async initializate() {
        await connect(process.env.MONGO_URL || 'Error')
        await this.guilds.cache.get((<string>process.env.GUILD_ID))?.commands.set(this.slashCommands)

        try {
            let array = []
            for (let i = 0; i < this.slashCommands.length; i++) {
                const command = this.slashCommands[i]
                if (command.category == "DEV") continue;
                array.push(command)
            }

            await this.application?.commands.set(array)
            this.guilds.cache.get((<string>process.env.GUILD_ID))?.commands.set(this.slashCommands)
        } catch(err: any) {

            for (let i = 0; i < this.guilds.cache.size; i++) {
                const guild = (<Guild[]>Array.from(this.guilds.cache.values()))[i]
                if (guild.id == `${process.env.GUILD_ID}`) {
                    guild.commands.set([])
                    continue
                };
    
                let array = []
                for (let i = 0; i < this.slashCommands.length; i++) {
                    const command = this.slashCommands[i]
                    if (command.category == "DEV" && ![process.env.DEV_ID].includes(guild.id)) continue;
                    array.push(command)
                }
                guild.commands.set(array)
            }
        }
        
        return console.log('Database conectada com sucesso!');
    }

    loadEvents() {
        const categories = readdirSync('src/events')

        for (const category of categories) {
            const events = readdirSync(`src/events/${category}`)

            for (const event of events) {
                const eventClass = require(join(process.cwd(), `src/events/${category}/${event}`))
                const evt = new (eventClass)(this)

                this.on(evt.name, evt.run)
            }
        }
    }

    loadSlashCommands(dir = 'src/slashCommands') {
        const categories = readdirSync(dir)

        for (const category of categories) {
            const commands = readdirSync(`${dir}/${category}`)

            for (const command of commands) {

                if (!command.includes('.ts')) break;
                const commandClass = require(join(process.cwd(), `${dir}/${category}/${command}`))
                const cmd = new (commandClass)(this)

                this.slashCommands.push(cmd)
            }
        }
    }
}

export { iOfSlash, CustomClient }
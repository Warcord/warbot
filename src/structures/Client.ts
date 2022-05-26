import { readdirSync, existsSync } from "fs";
import { join } from "path";

import { WarCord } from 'warcord'
import { Client, Interaction, ClientOptions } from 'discord.js';
import { connect } from 'mongoose';
import config from '../../config.json'

interface iOfSlash {
    name: string;
    description: string;
    run(interaction: Interaction): Promise<void>
}

class CustomClient extends Client {

    slashCommands: iOfSlash[];
    pvSlashCommands: iOfSlash[];
    warcord: WarCord
    config: any;

    constructor(options: ClientOptions) {
        super(options)

        this.config = config
        this.slashCommands = [];
        this.pvSlashCommands = [];
        this.loadSlashCommands()
        this.loadEvents()
        this.warcord = new WarCord(`${process.env.APP_ID}`)
    }

    async initializate() {
        await connect(process.env.MONGO_URL || 'Error')
        await this.guilds.cache.get((<string>process.env.GUILD_ID))?.commands.set(this.slashCommands)
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
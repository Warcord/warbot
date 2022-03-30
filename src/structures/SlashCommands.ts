import { CustomClient } from './Client'
import { ApplicationCommand } from 'discord.js'

class SlashCommands {

    client: CustomClient
    name: string
    description: string
    options: ApplicationCommand["options"]
    
    constructor(client: CustomClient, options: { name: string, description: string, options: ApplicationCommand["options"] }) {
        this.client = client
        this.name = options.name
        this.description = options.description
        this.options = options.options
    }
}

export { SlashCommands }
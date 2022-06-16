import { CustomClient } from './Client'
import { ApplicationCommand } from 'discord.js'


type AllCategory = "WOT" | "UTILS" | "DEV"
class SlashCommands {

    client: CustomClient
    name: string
    description: string
    options?: ApplicationCommand["options"]
    category: AllCategory
    
    constructor(client: CustomClient, options: { name: string, description: string, options?: ApplicationCommand["options"] }, category: AllCategory) {
        this.client = client
        this.name = options.name
        this.description = options.description
        this.options = options.options
        this.category = category
    }
}

export { SlashCommands }
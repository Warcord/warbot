import { config } from 'dotenv'
import { CustomClient } from './src/structures/Client'
config({ path: '.env' })

const client = new CustomClient({ 
    intents: 3919,
    allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: true
    }
})

client.login(process.env.TOKEN)
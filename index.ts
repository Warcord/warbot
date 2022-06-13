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

process.on('unhandledRejection', (reason: Error, promise) => {
  return client.log.errorLog(reason)
});

client.login(process.env.TOKEN)
import { readFileSync, writeFileSync } from 'fs'

async function writeLog(data: { message: string }) {

    const fileContent = await readFileSync('src/logs/user-use.log')

    await writeFileSync('src/logs/user-use.log', `${fileContent}\n${data.message}`)
    return console.log('[LOG] A new log updated.')
}

export { writeLog }
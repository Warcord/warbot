import { readdirSync } from 'fs'

const readDir = async (path: string): Promise<{ WargamingCommands: { WorldOfTanks: Array<string | undefined>, WorldOfTanksBlitz: Array<string | undefined> }, Information: Array<string | undefined>, Configuration: Array<string | undefined> }> => {
    const dirs = await readdirSync(`src/${path}`)

    const obj: { WargamingCommands: { WorldOfTanks: Array<string | undefined>, WorldOfTanksBlitz: Array<string | undefined> }, Information: Array<string | undefined>, Configuration: Array<string | undefined> } = {
        WargamingCommands: {
            WorldOfTanks: [],
            WorldOfTanksBlitz: []
        },
        Information: [],
        Configuration: []
    }

    for (const dir of dirs) {
        if (dir == 'config') {
            const files = (<string[]>await readdirSync(`src/${path}/${dir}`))
            for (const file of files) {
                const newFile = file.replace('.ts', '')
                obj.Configuration.push(newFile)
            }
        } else if (dir == 'info') {
            const files = (<string[]>await readdirSync(`src/${path}/${dir}`))
            for (const file of files) {
                const newFile = file.replace('.ts', '')
                obj.Information.push(newFile)
            }
        } else if (dir == 'wot') {
            const files = (<string[]>await readdirSync(`src/${path}/${dir}`))
            for (const file of files) {
                const newFile = file.replace('.ts', '')
                obj.WargamingCommands.WorldOfTanks.push(newFile)
            }
            
        } else if (dir == 'wot-blitz') {
            const files = (<string[]>await readdirSync(`src/${path}/${dir}`))
            for (const file of files) {
                const newFile = file.replace('.ts', '')
                obj.WargamingCommands.WorldOfTanksBlitz.push(newFile)
            }
        }
    }

    return obj;
}

export { readDir }
import { Schema, model } from 'mongoose'

const configSchema = new Schema({
    guildID: { type: String, required: true },
    activeGames: { type: [String], default: ["World of Tanks", "World of WarShips", "World of Tanks Console", "World of Tanks Blitz"] },
    realm: { type: String, required: true, default: "na" }
}, {
    timestamps: true
})

export = model('config', configSchema)
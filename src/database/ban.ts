import { Schema, model } from 'mongoose'

const banSchema = new Schema({
    userID: { type: String, unique: true, required: true },
    authorID: { type: String, required: true },
    reason: { type: String }
}, {
    timestamps: true
})

export = model('banned-users', banSchema)
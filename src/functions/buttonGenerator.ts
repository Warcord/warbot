import { MessageButton, MessageButtonStyleResolvable } from "discord.js"

const create = (button: { style: string, customId: string, label?: string, emoji?: string}): MessageButton => {

    const returns = new MessageButton()
        .setStyle((<MessageButtonStyleResolvable>`${button.style}`))
        .setCustomId(`${button.customId}`)

        button.label == undefined? '' : returns.setLabel(`${button.label}`)
        button.emoji == undefined? '' : returns.setEmoji(`${button.emoji}`)

    return returns
}

export { create }
import { CommandInteraction, GuildMember, Interaction, MessageAttachment, User } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs'
import moment from 'moment'
import stack from 'stack-trace'
import { CustomClient } from '../structures/Client';

export class WarLog {

    async userLog(interaction: CommandInteraction): Promise<void> {

        let strUser;

        if (interaction.member) {
            strUser = `${(<User>interaction.member.user).tag}(${(<GuildMember>interaction.member).id}) - GuildId: ${interaction.guild?.id}`
        } else {
            strUser = `${interaction.user.tag}(${interaction.user.id})`
        }

        const date = `[${moment(Date.now()).format('DD-MM-YYYY')}]`

        let fileContent = readFileSync('src/logs/commands.log')
        writeFileSync('src/logs/commands.log', `${`${fileContent}`.length > 1 ? `${fileContent}\n` : ''}${date} ${strUser} - Command: ${interaction.commandName}`)
        return;
    }

    async errorLog(error: Error) {

        const errorp = stack.parse(error)[0]
        const date = `[${moment(Date.now()).format('DD-MM-YYYY')}]`

        let fileContent = readFileSync('src/logs/errors.log')
        writeFileSync('src/logs/errors.log', `${`${fileContent}`.length > 1 ? `${fileContent}\n` : ''}${date} ${errorp.getTypeName()}: ${errorp.getFunctionName() ? errorp.getFunctionName() : errorp.getMethodName()} - Information: ${errorp.getFileName()}:${errorp.getLineNumber()}:${errorp.getColumnNumber()}`)
    }

}
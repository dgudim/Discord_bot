import { ICommand } from "wokcommands";
import { toggleTerminalChannel } from "../index"
import { combinedReply } from "../utils";

export default {
    category: 'Administration',
    description: 'Enable terminal mode in this channel',

    slash: 'both',
    testOnly: true,
    ownerOnly: true,
    hidden: true,

    callback: async ({ interaction, message, channel }) => {

        const user = interaction ? interaction.user : message.author;

        const sucessfull = toggleTerminalChannel(channel, user.id);
        
        await combinedReply(interaction, message, `Turned terminal mode ${sucessfull ? "ON" : "OFF"} for user ${user.username}`);
    }
} as ICommand
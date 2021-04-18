import * as discord from "discord.js";
import { CommandManager } from "./command/command";
import { IConfig } from "./defs";
import { Logger } from "./logger";
import profanities from 'profanities';

/**
 * Controlls all the main actions within the bot
 *
 * @export
 * @class DiscordBot
 */
export class DiscordBot {
    public client: discord.Client;
    private command: CommandManager;

    constructor(private config: IConfig, public logger: Logger) {
        this.client = new discord.Client();
        this.command = new CommandManager(this);
    }

    connect() {
        this.client.once("ready", () => {
            this.getPalaceGuild();
            this.client.user.setActivity('Palace Network', {type: 'WATCHING'});
            const botCH = this.client.channels.cache.get("777224676803346472") as discord.TextChannel;
            botCH.send("Have no fear! The Palace Bot is here! 😎");
            this.logger.log("Successfully connected to Discord!");
        });

        this.client.on("message", async (message: discord.Message) => {


            const unsplit: string = message.content.replace(/`/g, "").toLowerCase();
            const parts: string[] = unsplit.split(" ");

            if (message.author.id !== this.client.user.id) {
                for (let part in parts) {
                    if (part !== (undefined || null || "")) {
                        if (profanities.indexOf(parts[part]) > -1) {
                            message.delete();
                            return;
                        }
                    }
                }
            }

            if (message.content[0] === "!" && message.content[1] !== " ") {
                let regex: RegExp = /!(\D+)/;
                try {
                    let commandName: string = regex.exec(message.content)[1];
                    if (!commandName) return;

                    const response = await this.command.runCommand(commandName, message);

                    if (response) {
                        if (response.mention) {
                            message.reply(response.response);
                            setTimeout(() => message.delete(), 500);
                        } else {
                            message.channel.send(response.response);
                        }
                    }
                } catch (e) {
                    return;
                }
            }

            if (message.mentions.has(this.client.user) && !message.mentions.everyone) {
                message.react('👋🏻');
                message.reply('Hello! I am the Palace Discord Bot! I can only really respond to commands. Please use **!help** for a list of commands!');
            } else if (message.content.includes("palace bot")) {
                message.reply('Hello! I am the Palace Discord Bot! I can only really respond to commands. Please use **!help** for a list of commands!');
            }

            if (message.content === "I love you Palace Bot!") {
                const attachment = new discord.MessageAttachment('https://media.giphy.com/media/XftasWlvGSB7tL2d3l/giphy.gif');
                message.react('❤️');
                message.reply(attachment);
            }
        });
        this.client.login(this.config.token);
    }

    getPalaceGuild(): discord.Guild {
        let palaceId = "516147385110495232";
        let returnedGuild: discord.Guild = null;

        return returnedGuild = this.client.guilds.resolve(palaceId);
    }

}

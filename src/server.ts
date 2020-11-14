import "reflect-metadata";

import * as discord from "discord.js";
// import fs from "fs-extra";

import { Command } from "./command/command";
import { CommandResponse } from "./command/commands/command";
import { IConfig } from "./defs";
import { Logger } from "./logger";

export interface UserCanAccept {
    username: string;
    uuid: string;
    discordUsername: string;
    rank: string;
}

interface UserTimeouts {
    discordInfo: string;
    timeout: any;
}


/**
 * Controlls all the main actions within the bot
 *
 * @export
 * @class DiscordBot
 */
export class DiscordBot {
    public client: discord.Client;
    private command: Command;

    // TODO: Add a swear filter to the bot
    // private swears: string[] = [];

    constructor(private config: IConfig, public logger: Logger, private swearFileLocation: string) {
        this.client = new discord.Client();
        this.command = new Command(this);
    }

    connect() {
        this.client.on("ready", () => {
            console.log("Succesfully connected to Discord.");
            this.getPalaceGuild();
            this.client.user.setActivity('Palace Network', {type: 'WATCHING'});
        });

        this.client.on("message", (message: discord.Message) => {
            console.log(`Incoming Message: ${message.content}`);
            // this.logger.log(`Incoming Message:  ${message.content}`);
            if (message.content[0] === "!" && message.content[1] !== " ") {
                let regex: RegExp = /!(\D+)/;
                try {
                    let commandName: string = regex.exec(message.content)[1];
                    if (commandName === (null || undefined)) return;

                    this.command.runCommand(commandName, message).then((response: CommandResponse) => {
                        if (response !== null) {
                            if (response.mention) {
                                message.reply(response.response);
                                message.delete();
                            } else {
                                message.channel.send(response.response);
                            }
                        }
                    })
                } catch (e) {
                    return;
                }
            }
            if (message.content.includes("bot") && message.channel.id === "777224676803346472") {
                message.react('👋🏻');
                message.reply(`Hi! I am the Palace Bot, I only respond to commands. Please use **!help** for the supported commands!`);
            }
        })
        this.client.login(this.config.token);
    }

    getPalaceGuild(): discord.Guild {
        let palaceId = "516147385110495232";
        let returnedGuild: discord.Guild = null;
        
        return returnedGuild = this.client.guilds.resolve(palaceId);
    }

}
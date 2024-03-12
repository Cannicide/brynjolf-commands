import BrynjolfCommand from "./commands/slash.js";
import { REST } from "@discordjs/rest";
import { Routes, RESTPutAPIApplicationCommandsResult, RESTPutAPIApplicationGuildCommandsResult } from "discord-api-types/v10";

/**
 * Manages command storage, execution, and registration. 
 * You should not need to use this class directly; use the 
 * {@link Members.commands | commands} member instead.
 */
class BrynjolfCommandManager extends Map<string, BrynjolfCommand> {

    /** @internal */
    constructor() {
        super();
    }

    /**
     * Executes a command of the given name, if possible. 
     * The data parameters are passed to the command's 
     * handler method as parameters.
     * 
     * @example
     * // Common use in Discord.js 'interactionCreate' event:
     * commands.execute(interaction.commandName, interaction);
     */
    public execute(commandName: string, ...data: any[]) {
        // Executes the actions of a command, if it exists
        const cmd = this.get(commandName);
        if (!cmd) return;
        cmd._action(...data);
    }

    /** Unregisters the command with the given name. */
    public async unregister(commandName: string) {
        if (!TokenManager.token) {
            console.error("[BrynjolfError] You must provide your Discord bot's token to unregister commands.");
            return false;
        }

        if (!TokenManager.clientId) {
            console.error("[BrynjolfError] You must provide your Discord bot's client ID to unregister commands.");
            return false;
        }

        this.delete(commandName);
        return await this._registerAll(true);
    }

    /** Unregisters all commands associated with this application. */
    public async unregisterAll() {
        if (!TokenManager.token) {
            console.error("[BrynjolfError] You must provide your Discord bot's token to unregister commands.");
            return false;
        }

        if (!TokenManager.clientId) {
            console.error("[BrynjolfError] You must provide your Discord bot's client ID to unregister commands.");
            return false;
        }

        this.clear();
        return await this._registerAll(true);
    }

    /** Registers all commands created using \@brynjolf/commands. */
    public async registerAll() {
        if (!TokenManager.token) {
            console.error("[BrynjolfError] You must provide your Discord bot's token to register commands.");
            return false;
        }

        if (!TokenManager.clientId) {
            console.error("[BrynjolfError] You must provide your Discord bot's client ID to register commands.");
            return false;
        }

        return await this._registerAll();
    }

    /** @internal Internally used to handle command REST API requests. */
    private async _registerAll(isUnregister: boolean = false) {
        if (!TokenManager.token || !TokenManager.clientId) return false;

        const rest = new REST().setToken(TokenManager.token);
        const body = [...commands.values()].map(cmd => Reflect.get(cmd, "_opts"));

        const messages = {
            "unregister": {
                pre: (body: any[]) => `Unregistering all application (/) commands.`,
                post: (data: RESTPutAPIApplicationCommandsResult|RESTPutAPIApplicationGuildCommandsResult) => `Successfully unregistered all application (/) commands.`
            },
            "register": {
                pre: (body: any[]) => `Registering ${body.length} application (/) commands.`,
                post: (data: RESTPutAPIApplicationCommandsResult|RESTPutAPIApplicationGuildCommandsResult) => `Successfully registered ${data.length} application (/) commands.`
            },
            pre(body: any[]) {
                if (isUnregister) return this.unregister.pre(body);
                else return this.register.pre(body);
            },
            post(data: RESTPutAPIApplicationCommandsResult|RESTPutAPIApplicationGuildCommandsResult) {
                if (isUnregister) return this.unregister.post(data);
                else return this.register.post(data);
            }
        };

        try {
            console.log(messages.pre(body));
            let data: RESTPutAPIApplicationCommandsResult|RESTPutAPIApplicationGuildCommandsResult;

            if (TokenManager.guildId) {
                data = await rest.put(
                Routes.applicationGuildCommands(TokenManager.clientId, TokenManager.guildId),
                { body },
                ) as RESTPutAPIApplicationGuildCommandsResult;
            }
            else {
                data = await rest.put(
                    Routes.applicationCommands(TokenManager.clientId),
                    { body }
                ) as RESTPutAPIApplicationCommandsResult;
            }
    
            console.log(messages.post(data));
        } catch (error) {
            console.error(error);
            return false;
        }

        return true;
    }

    /**
     * Sets the token, application ID, and optional guild ID. 
     * This method must be called before registering or 
     * unregistering any commands using the {@link Members.commands | command manager}.
     */
    public setToken(token: string, applicationId: string, devGuildId?: string) {
        TokenManager.setToken(token);
        TokenManager.setClientId(applicationId);
        if (devGuildId) TokenManager.setGuildId(devGuildId);
    }

}

/** The primary command manager for \@brynjolf/commands. */
const commands = new BrynjolfCommandManager();
export default commands;

class TokenManager {
    private static _token?: string = undefined;
    private static _clientId?: string = undefined;
    private static _guildId?: string = undefined;

    public static get token() {
        return this._token;
    }

    public static get clientId() {
        return this._clientId;
    }

    public static get guildId() {
        return this._guildId;
    }

    public static setToken(token: string) {
        this._token = token;
    }

    public static setClientId(id: string) {
        this._clientId = id;
    }

    public static setGuildId(id: string) {
        this._guildId = id;
    }
};

export { BrynjolfCommandManager };
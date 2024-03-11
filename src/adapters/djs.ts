import { BaseExecutor } from "./base.js";
import type { ChatInputCommandInteraction } from "discord.js";

/** Adapter for handling Discord.js command interactions. */
class DjsExecutor extends BaseExecutor {

    constructor(commandLike: any) {
        super(commandLike);
    }

    /**
     * @see Uses [Discord.js ChatInputCommandInteraction](https://discord.js.org/#/docs/discord.js/14.14.1/class/ChatInputCommandInteraction)
     */
    public override execute(callback: (interaction: ChatInputCommandInteraction) => any) {
        super.execute(callback);
    }

}

export { DjsExecutor };
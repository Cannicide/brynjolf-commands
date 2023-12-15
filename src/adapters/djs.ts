import { BaseExecutor } from "./base.js";
import type { ChatInputCommandInteraction } from "discord.js";

// Discord.js adapter
class DjsExecutor extends BaseExecutor {

    constructor(commandLike: any) {
        super(commandLike);
    }

    public override execute(callback: (interaction: ChatInputCommandInteraction) => any) {
        super.execute(callback);
    }

}

export { DjsExecutor };
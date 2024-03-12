import { APIApplicationCommand } from "discord-api-types/v10";
import { BaseExecutor } from "./base.js";

/** Adapter for handling Discord API command interactions. */
class APIExecutor extends BaseExecutor {

    /** @internal */
    constructor(commandLike: any) {
        super(commandLike);
    }

    public override execute(callback: (interaction: APIApplicationCommand) => any) {
        super.execute(callback);
    }

}

export { APIExecutor };
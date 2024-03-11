
import commands from "../manager.js";
import fs from "node:fs";

/** Base adapter, the base result of {@link Members.Command.adapter | Command#adapter()}. */
class BaseExecutor {
    /** Internally stores command data. */
    protected command: any;

    constructor(commandLike: any) {
        this.command = commandLike;
    }

    /** Internally used to add a command to the command manager. */
    protected _register() {
        commands.set(this.command._opts.name, this.command);
    }

    /**
     * Utility method to log the Discord API-compatible 
     * command data for this command to a JSON file at the
     * provided absolute path.
     */
    public log(path: string) {
        path = path.replace("{name}", this.command._opts.name);
        fs.writeFileSync(path, JSON.stringify(this.command._opts, null, "\t"));
        return this;
    }

    /**
     * Defines the function to execute when the command is handled,
     * and automatically adds the command to the command manager.
     */
    public execute(callback: (interaction: any) => any) {
        this._register();
        Object.defineProperty(this.command, "_action", { value: callback });
    }

}

export { BaseExecutor };
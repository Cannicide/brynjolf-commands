
import commands from "../manager.js";

// Base adapter
class BaseExecutor {

    protected command: any;

    constructor(commandLike: any) {
        this.command = commandLike;
    }

    // TODO: autocomplete

    protected _register() {
        commands.set(this.command._opts.name, this.command);
    }

    // TODO: method to log command to JSON file

    public execute(callback: (interaction: any) => any) {
        this._register();
        Object.defineProperty(this.command, "_action", { value: callback });
    }

}

export { BaseExecutor };
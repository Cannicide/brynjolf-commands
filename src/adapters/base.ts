
import commands from "../manager.js";
import fs from "node:fs";

// Base adapter
class BaseExecutor {

    protected command: any;

    constructor(commandLike: any) {
        this.command = commandLike;
    }

    protected _register() {
        commands.set(this.command._opts.name, this.command);
    }

    public log(path: string) {
        path = path.replace("{name}", this.command._opts.name);
        fs.writeFileSync(path, JSON.stringify(this.command._opts, null, "\t"));
        return this;
    }

    public execute(callback: (interaction: any) => any) {
        this._register();
        Object.defineProperty(this.command, "_action", { value: callback });
    }

}

export { BaseExecutor };
import { BaseExecutor } from "./base.js";

// Register-only adapter
class RegisterOnlyExecutor extends BaseExecutor {

    constructor(commandLike: any) {
        super(commandLike);
        this._register();
    }

    /** @private */
    public override execute() {};

}

export { RegisterOnlyExecutor };
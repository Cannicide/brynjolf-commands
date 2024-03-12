import { BaseExecutor } from "./base.js";

/** Adapter for registering commands without handling them. */
class RegisterOnlyExecutor extends BaseExecutor {

    /** @internal */
    constructor(commandLike: any) {
        super(commandLike);
        this._register();
    }

    /**
     * @internal Disabled for RegisterOnlyExecutor
     * @private
     */
    public override execute() {};

}

export { RegisterOnlyExecutor };
import { APIExecutor } from "./api.js";
import { BaseExecutor } from "./base.js";
import { DjsExecutor } from "./djs.js";
import { RegisterOnlyExecutor } from "./register.js";

/** Enumeration of adapter types. */
enum BrynjolfAdapter {
    /** Adapter for handling Discord API interactions. */
    API = "API",
    /** Adapter for registering commands without handling them. */
    REGISTER_ONLY = "None",
    /** Adapter for handling Discord.js interactions. */
    DJS = "Discord.js"
}

// Adapter map
const AdapterMap = new Map([
    [undefined, BaseExecutor],
    [BrynjolfAdapter.API, APIExecutor],
    [BrynjolfAdapter.REGISTER_ONLY, RegisterOnlyExecutor],
    [BrynjolfAdapter.DJS, DjsExecutor]
]);

export { BrynjolfAdapter as Adapter, AdapterMap, APIExecutor, BaseExecutor, DjsExecutor, RegisterOnlyExecutor }
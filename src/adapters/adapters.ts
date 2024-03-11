import { APIExecutor } from "./api.js";
import { BaseExecutor } from "./base.js";
import { DjsExecutor } from "./djs.js";
import { RegisterOnlyExecutor } from "./register.js";

// Adapter enum
enum BrynjolfAdapter {
    API = "API",
    REGISTER_ONLY = "None",
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
import { ApplicationCommandOptionType, ApplicationCommandType, LocalizationMap, PermissionFlagsBits } from "discord-api-types/v10";
import BaseCommandData from "./base.js";
import { BrynjolfArgumentTranslator, ResultOptions } from "../opts.js";
import parse from "../syntax.js";
import { Adapter, AdapterMap } from "../adapters/adapters.js";
import { APIExecutor } from "../adapters/api.js";
import { DjsExecutor } from "../adapters/djs.js";
import { RegisterOnlyExecutor } from "../adapters/register.js";

/** Discord API-compatible object representing slash commands. */
interface SlashCommandData extends BaseCommandData {
    /** Type of the command (chat input, i.e. slash command). */
    type: ApplicationCommandType.ChatInput;
    /** List of the command's arguments. */
    options: ResultOptions[];
}

/** Manage member and DM permissions for the command. */
class BrynjolfCommandPermissions {

    /**
     * @internal Internally used to modify private variable in command.
     * @private
     */
    private _setter: (key: "dm_permission"|"default_member_permissions", value: any) => any;
    /**
     * @internal Internally stores command.
     * @private
     */
    private _cmd: BrynjolfCommand;

    /** @internal */
    constructor(cmd: BrynjolfCommand, setter: (key: "dm_permission"|"default_member_permissions", value: any) => any) {
        this._setter = setter;
        this._cmd = cmd;
    }

    /**
     * Set member permissions for the command. ALL provided
     * permissions will be required to use the command.
     */
    public members(requiredPerms: (keyof typeof PermissionFlagsBits)[]) {
        const firstPerm = requiredPerms.shift();
        if (firstPerm === undefined) return this._cmd;

        let perms;
        if (requiredPerms.length == 0) perms = PermissionFlagsBits[firstPerm];
        else perms = requiredPerms.reduce((prev, curr) => prev | PermissionFlagsBits[curr], PermissionFlagsBits[firstPerm]);

        this._setter("default_member_permissions", perms);
        return this._cmd;
    }

    /** Set whether the command can be used in DMs. */
    public dms(enabled: boolean = true) {
        this._setter("dm_permission", enabled);
        return this._cmd;
    }
}

class BrynjolfCommand {

    /** @private */
    private _opts: SlashCommandData;
    /** @private */
    public _action: Function = () => {};

    public readonly perms: BrynjolfCommandPermissions;

    constructor(name: string, description: string) {
        this._opts = {
            name,
            description,
            type: ApplicationCommandType.ChatInput,
            options: []
        };
        this.perms = new BrynjolfCommandPermissions(this, (k: "dm_permission"|"default_member_permissions", v) => Object.defineProperty(this._opts, k, { value: v }));
    }

    public args(argStrings: TemplateStringsArray|string[], ...argOptions: BrynjolfArgumentTranslator[]) {
        // Parse new args
        const newArgs = parse(argStrings, ...argOptions);

        // Add args and coalesce potentially duplicated subgroups/subcommands
        if (newArgs.length > 0) {
            let i = -1;
            for (const arg of newArgs) {
                const existingArg = this._opts.options.find(opt => opt.type == arg.type && opt.name == arg.name);
                i++;

                // Coalesce duplicated subgroups
                if (i == 0 && arg.type == ApplicationCommandOptionType.SubcommandGroup) {
                    // Does not exist yet, simply add
                    if (!existingArg) {
                        this._opts.options.push(arg);
                        continue;
                    }

                    // Already exists, coalesce
                    existingArg.options ??= [];
                    arg.options ??= [];
                    for (const subcommand of arg.options.filter(opt => opt.type == ApplicationCommandOptionType.Subcommand)) {
                        const existingSub = existingArg.options.find(opt => opt.type == subcommand.type && opt.name == subcommand.name);

                        // Does not exist yet, simply add
                        if (!existingSub) {
                            existingArg.options.push(subcommand);
                        }
                        // Already exists, coalesce
                        else {
                            existingSub.options ??= [];
                            subcommand.options ??= [];
                            existingSub.options = existingSub.options.concat(subcommand.options);
                        }
                    }
                }
                // (Ignore subcommands already within coalesced subgroups)
                // Coalesce duplicated subcommands
                else if (i == 0 && arg.type == ApplicationCommandOptionType.Subcommand) {
                    // Does not exist yet, simply add
                    if (!existingArg) {
                        this._opts.options.push(arg);
                        continue;
                    }

                    // Already exists, coalesce
                    existingArg.options ??= [];
                    arg.options ??= [];
                    existingArg.options = existingArg.options.concat(arg.options);
                }
                // Coalesce args
                else if (arg.type != ApplicationCommandOptionType.SubcommandGroup && arg.type != ApplicationCommandOptionType.Subcommand) {
                    const existingAnyArg = this._opts.options.find(opt => opt.name == arg.name);
                    const existingAmount = newArgs.filter(opt => opt.name == arg.name).length;

                    // Does not exist yet, simply add
                    if (!existingAnyArg) {
                        this._opts.options.push(arg);
                        continue;
                    }

                    // If the arg already exists, ignore duplicate and warn
                    console.warn(`[BrynjolfWarning] At least ${existingAmount} arguments with the same name were detected in the command '${this._opts.name}'\nThe duplicated arguments have been automatically merged; please ensure your arguments have unique names.`);
                }
            }
        }

        return this;
    }

    public options(...argOptions: BrynjolfArgumentTranslator[]) {
        const argStrings = argOptions.map(arg => {
            const type = (Reflect.get(arg, "data") as ResultOptions).type;
            const isSub = type == ApplicationCommandOptionType.Subcommand || type == ApplicationCommandOptionType.SubcommandGroup;

            return isSub ? "-" : (arg.get("req") ? "<->" : "[-]");
        }).join(" ").split("-");

        return this.args(argStrings, ...argOptions);
    }

    public localDesc(descs: LocalizationMap) {
        this._opts.description_localizations = descs;
        return this;
    }

    public localName(names: LocalizationMap) {
        this._opts.name_localizations = names;
        return this;
    }

    public custom(customProperty: string, value: any) {
        Object.defineProperty(this._opts, customProperty, { value });
        return this;
    }

    public adapter(adapter: Adapter.API): APIExecutor;
    public adapter(adapter: Adapter.DJS): DjsExecutor;
    public adapter(adapter: Adapter.REGISTER_ONLY): RegisterOnlyExecutor;
    public adapter(adapter: Adapter) {
        const Executor = AdapterMap.get(adapter)!;
        return new Executor(this);
    }

}

export default BrynjolfCommand;
export { SlashCommandData, BrynjolfCommandPermissions };
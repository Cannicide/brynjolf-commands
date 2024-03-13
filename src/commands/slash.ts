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

/** Create, configure, and handle a command. */
class BrynjolfCommand {

    /**
     * @internal Internally used to store command data.
     * @private
     */
    private _opts: SlashCommandData;
    /**
     * @internal Internally used to store command handler.
     * @private
     */
    public _action: Function = () => {};
    /**
     * @internal Internally used to store argument translators.
     * @private
     */
    public _translators: BrynjolfArgumentTranslator[] = [];

    /** Permissions of the command. */
    public readonly perms: BrynjolfCommandPermissions;

    /** Create a new Command object. */
    constructor(name: string, description: string) {
        this._opts = {
            name,
            description,
            type: ApplicationCommandType.ChatInput,
            options: []
        };
        this.perms = new BrynjolfCommandPermissions(this, (k: "dm_permission"|"default_member_permissions", v) => Object.defineProperty(this._opts, k, { value: v }));
    }

    /**
     * Add arguments to the command via template syntax. This method
     * is a template tag, and is used differently than a normal
     * function. If you want to add arguments via a normal function,
     * use {@link Members.Command.options | Command#options()} instead.
     * 
     * The custom syntax is as follows:
     * ```js
     * // With square brackets, you can
     * // add an optional argument:
     * command.args`[${arg}]`
     * 
     * // With less/greater than signs, you can
     * // add a required argument:
     * command.args`<${arg}>`
     * 
     * // With nothing surrounding it, you can
     * // add subcommands and subgroups:
     * command.args`${subgroup} ${subcommand} <${arg}>`
     * 
     * // Add multiple arguments at once:
     * command.args`<${arg1}> <${arg2}> [${arg3}]`
     * ```
     */
    public args(argStrings: TemplateStringsArray|string[], ...argOptions: BrynjolfArgumentTranslator[]) {
        this._translators.push(...argOptions);

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

    /**
     * The non-template equivalent of 
     * {@link Members.Command.args | Command#args()}. Add arguments
     * to the command without the terseness of template syntax.
     * 
     * The usage is as follows:
     * ```js
     * // Add an argument:
     * command.options(arg)
     * 
     * // Add multiple arguments at once:
     * command.options(subcommand, arg1, arg2)
     * ```
     * 
     * @remarks
     * Note: this requires arguments created with {@link Members.opts | opts}
     * to define the `req` property to determine if they are required.
     */
    public options(...argOptions: BrynjolfArgumentTranslator[]) {
        const argStrings = argOptions.map(arg => {
            const type = (Reflect.get(arg, "data") as ResultOptions).type;
            const isSub = type == ApplicationCommandOptionType.Subcommand || type == ApplicationCommandOptionType.SubcommandGroup;

            return isSub ? "-" : (arg.get("req") ? "<->" : "[-]");
        }).join(" ").split("-");

        return this.args(argStrings, ...argOptions);
    }

    /** Set localized descriptions for the command. */
    public localDesc(descs: LocalizationMap) {
        this._opts.description_localizations = descs;
        return this;
    }

    /** Set localized names for the command. */
    public localName(names: LocalizationMap) {
        this._opts.name_localizations = names;
        return this;
    }

    /**
     * Set custom properties for the command. Useful for features 
     * Discord may add in the future that aren't immediately 
     * given direct support in \@brynjolf/commands.
     */
    public custom(customProperty: string, value: any) {
        Object.defineProperty(this._opts, customProperty, { value });
        return this;
    }

    /** Select an adapter to handle Discord API interactions. */
    public adapter(adapter: Adapter.API): APIExecutor;
    /** Select an adapter to handle Discord.js interactions. */
    public adapter(adapter: Adapter.DJS): DjsExecutor;
    /** Select an adapter that registers without handling. */
    public adapter(adapter: Adapter.REGISTER_ONLY): RegisterOnlyExecutor;
    /** Select an adapter to determine command handling behavior. */
    public adapter(adapter: Adapter) {
        const Executor = AdapterMap.get(adapter)!;
        return new Executor(this);
    }

}

export default BrynjolfCommand;
export { SlashCommandData, BrynjolfCommandPermissions };
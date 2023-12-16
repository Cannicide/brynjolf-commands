
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { BrynjolfArgumentTranslator, ResultOptions } from "./opts.js";

// Handle syntax such as:
// `${subcommand} <${arg1}> [${arg2}]`

export default function parse(strings: TemplateStringsArray|string[], ...values: BrynjolfArgumentTranslator[]): ResultOptions[] {
    const args: ResultOptions[] = [];
    let addToSubgroup = false;
    let addToSubcommand = false;

    for (const str of strings) {
        const parts = str.split(/\s+/);

        const classifier = parts.at(-1);
        if (classifier === undefined) continue; 

        const isSub = classifier.length == 0;
        const isRequired = classifier == "<";
        
        const rawOpts = values.shift();
        if (rawOpts === undefined) continue;
        const opts = rawOpts.clone()._translate();

        // Subgroup/subcommand functionality:
        if (isSub) {
            // If subgroup, append to args; toggle addToSubgroup
            if (opts.type == ApplicationCommandOptionType.SubcommandGroup) {
                // If a subgroup already exists, ignore this subgroup
                if (args.length > 0 && args[0].type == ApplicationCommandOptionType.SubcommandGroup) continue;

                // Add subgroup
                args.push(opts);
                addToSubgroup = true;
            }
            else if (opts.type == ApplicationCommandOptionType.Subcommand) {
                // If subcommand, and addToSubgroup toggled, append to args and add to subgroup options; toggle addToSubcommand and untoggle addToSubgroup
                if (addToSubgroup) {
                    // If subgroup already contains a subcommand, ignore this subcommand
                    if (args[0].options?.length) continue;

                    // Add subcommand to subgroup
                    const subgroup = args[0];
                    subgroup.options ??= [];
                    subgroup.options.push(opts);
                    addToSubgroup = false;
                }
                // If a subcommand already exists, ignore this subcommand
                else if (args.length > 0 && args[0].type == ApplicationCommandOptionType.Subcommand) continue;

                // Add subcommand
                args.push(opts);
                addToSubcommand = true;
            }
        }
        else {
            if (isRequired) opts.required ??= true;
            else opts.required ??= false;

            if (addToSubcommand) {
                const subcmd = args.at(-1);
                subcmd!.options ??= [];
                subcmd!.options.push(opts);
            }
            else args.push(opts);
        }
    }

    if (addToSubcommand && args.length > 1 && args[0].type == ApplicationCommandOptionType.SubcommandGroup) args.pop();
    return args;
}
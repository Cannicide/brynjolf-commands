import Command from "../../lib/commands/slash.js";
import commands from "../../lib/manager.js";
import opts from "../../lib/opts.js";
import { Adapter } from "../../lib/adapters/adapters.js";
import { ApplicationCommandOptionType } from "discord.js";
import fs from "node:fs";
import { jest } from "@jest/globals";

const testUtils = {
    logCommand(cmd) {
        /* @ts-ignore */
        fs.writeFileSync(`./test/commands/logs/${cmd._opts.name}.slash.json`, JSON.stringify(cmd._opts, null, "\t"));
    }
}

// Test correct creation and output

test("Command creation.", () => {

    // Test with just basic args

    const arg1 = opts.string({
        name: "arg1",
        desc: "First test argument."
    });

    const arg2 = opts.boolean({
        name: "arg2",
        desc: "Second test argument."
    });

    const cmd1 = new Command("basic", "The first Brynjolf test command.")
    .args`<${arg1}> [${arg2}]`
    .perms.dms(true);

    /* @ts-ignore */
    expect(cmd1._opts.options[0]).toMatchObject({
        _brynjolf_type: "String",
        name: "arg1",
        description: "First test argument.",
        required: true,
        type: ApplicationCommandOptionType.String
    });

    /* @ts-ignore */
    expect(cmd1._opts.options[1]).toMatchObject({
        type: ApplicationCommandOptionType.Boolean,
        _brynjolf_type: "Boolean",
        name: "arg2",
        description: "Second test argument.",
        required: false
    });

    // Test command execution

    cmd1.adapter(Adapter.DJS)
    .log(`./test/commands/logs/{name}.slash.json`)
    .execute(i => {
        return true;
    });

    const cmd1Output = cmd1._action();
    expect(cmd1Output).toBe(true);

    // Test with subcommand args, including subargs
    
    const sub1 = opts.subcommand({
        name: "sub1",
        desc: "First test subcommand."
    });

    const cmd2 = new Command("subcmd", "Second test command.")
    .args`${sub1} [${arg1}]`;

    testUtils.logCommand(cmd2);

    /* @ts-ignore */
    expect(cmd2._opts.options[0]).toMatchObject({
        "type": 1,
        "_brynjolf_type": "Subcommand",
        "name": "sub1",
        "description": "First test subcommand.",
        "options": [
            {
                "type": 3,
                "_brynjolf_type": "String",
                "name": "arg1",
                "description": "First test argument.",
                "required": false
            }
        ]
    });

    // Test with same subcommand variable, but now no subargs

    const cmd3 = new Command("samesubcmd", "Third test command.")
    .args`${sub1}`;

    testUtils.logCommand(cmd3);

    /* @ts-ignore */
    expect(cmd3._opts.options[0]).toMatchObject({
        "type": 1,
        "_brynjolf_type": "Subcommand",
        "name": "sub1",
        "description": "First test subcommand."
        // No subarg
    });

    // Test with subgroup args

    const group1 = opts.subgroup({
        name: "group1",
        desc: "First test subgroup."
    });

    const cmd4 = new Command("subgroup", "Fourth test command.")
    .args`${group1} ${sub1} <${arg2}>`;

    testUtils.logCommand(cmd4);

    /* @ts-ignore */
    expect(cmd4._opts.options[0]).toMatchObject({
        "type": 2,
        "_brynjolf_type": "SubcommandGroup",
        "name": "group1",
        "description": "First test subgroup.",
        "options": [
            {
                "type": 1,
                "_brynjolf_type": "Subcommand",
                "name": "sub1",
                "description": "First test subcommand.",
                "options": [
                    {
                        "type": 5,
                        "_brynjolf_type": "Boolean",
                        "name": "arg2",
                        "description": "Second test argument.",
                        "required": true
                    }
                ]
            }
        ]
    });

    /* @ts-ignore */
    expect(cmd4._opts.options.length).toBe(1);

    // Test with exactly duplicated args

    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const cmd5 = new Command("dupeargs", "Fifth test command.")
    .args`<${arg1}> <${arg1}> <${arg1}> [${arg1}]`;

    testUtils.logCommand(cmd5);

    /* @ts-ignore */
    expect(cmd5._opts.options.length).toBe(1);
    /* @ts-ignore */
    expect(consoleSpy).toHaveBeenCalledWith(`[BrynjolfWarning] At least 4 arguments with the same name were detected in the command '${cmd5._opts.name}'\nThe duplicated arguments have been automatically merged; please ensure your arguments have unique names.`);

    // Test with duplicated subcommands

    const cmd6 = new Command("dupesubcmd", "Sixth test command.")
    .args`${sub1} ${sub1} ${sub1} <${arg1}>`
    .args`${sub1} [${arg2}]`;

    testUtils.logCommand(cmd6);

    /* @ts-ignore */
    expect(cmd6._opts.options.length).toBe(1);
    /* @ts-ignore */
    expect(cmd6._opts.options[0]).toMatchObject({
        "type": 1,
        "_brynjolf_type": "Subcommand",
        "name": "sub1",
        "description": "First test subcommand.",
        "options": [
            {
                "type": 3,
                "_brynjolf_type": "String",
                "name": "arg1",
                "description": "First test argument.",
                "required": true
            },
            {
                "type": 5,
                "_brynjolf_type": "Boolean",
                "name": "arg2",
                "description": "Second test argument.",
                "required": false
            }
        ]
    });

    // Test with duplicated subgroups

    const sub2 = opts.subcommand({ name: "sub2", desc: "Second test subcommand." });

    const cmd7 = new Command("dupegroup", "Sixth test command.")
    .args`${group1} ${group1} ${group1} ${sub1}`
    .args`${group1} ${sub2}`;

    testUtils.logCommand(cmd7);

    /* @ts-ignore */
    expect(cmd7._opts.options.length).toBe(1);
    /* @ts-ignore */
    expect(cmd7._opts.options[0]).toMatchObject({
        "type": 2,
        "_brynjolf_type": "SubcommandGroup",
        "name": "group1",
        "description": "First test subgroup.",
        "options": [
            {
                "type": 1,
                "_brynjolf_type": "Subcommand",
                "name": "sub1",
                "description": "First test subcommand."
            },
            {
                "type": 1,
                "_brynjolf_type": "Subcommand",
                "name": "sub2",
                "description": "Second test subcommand."
            }
        ]
    });
});

// Test command handling

test("Command handling (simulated interaction).", () => {
    const arg1 = opts.integer({
        name: "min",
        desc: "The lower bound."
    });

    const arg2 = opts.integer({
        name: "max",
        desc: "The upper bound."
    });

    new Command("random", "Generates a random integer within a range.")
    .args`<${arg1}> <${arg2}>`
    .adapter(Adapter.DJS)
    .execute(i => {
        const min = i.options.getInteger("min");
        const max = i.options.getInteger("max");

        const rand = Math.floor(Math.random() * (max - min + 1)) + min;
        i.reply(`Your random number is ${rand}.`);
    });

    const simulatedInteraction = {
        reply: jest.fn(() => {}),
        options: {
            getInteger(name) {
                if (name == "min") return 2;
                else if (name == "max") return 10;
                return undefined;
            }
        }
    };

    commands.execute("random",simulatedInteraction);
    expect(simulatedInteraction.reply).toHaveBeenCalledTimes(1);
});

// Test command registration

test("Command registration.", async () => {

    commands.clear();

    const arg1 = opts.integer({
        name: "min",
        desc: "The lower bound."
    });

    const arg2 = opts.integer({
        name: "max",
        desc: "The upper bound."
    });

    new Command("random", "Generates a random integer within a range.")
    .args`<${arg1}> <${arg2}>`
    .adapter(Adapter.DJS)
    .execute(i => {
        const min = i.options.getInteger("min");
        const max = i.options.getInteger("max");

        const rand = Math.floor(Math.random() * (max - min + 1)) + min;
        i.reply(`Your random number is ${rand}.`);
    });

    const token = fs.readFileSync("./test/commands/.env.local").toString("utf8").slice(6);
    commands.setToken(token, "818608310030041128", "668485643487412234");

    const TEST_REGISTRATION = false; // Added to prevent excessive Discord API calls during repeated testing
    if (!TEST_REGISTRATION) return;

    const noErrors = await commands.registerAll();
    expect(noErrors).toBe(true);

    const noErrors2 = await commands.unregisterAll();
    expect(noErrors2).toBe(true);
    expect(commands.size).toBe(0);
}, 30000);
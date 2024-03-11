import Command from "../../lib/commands/slash.js";
import commands from "../../lib/manager.js";
import opts from "../../lib/opts.js";
import { Adapter } from "../../lib/adapters/adapters.js";
import fs from "node:fs";
import { Client, IntentsBitField } from "discord.js";

const arg1 = opts.int({
    name: "min",
    desc: "The lower bound."
});

const arg2 = opts.int({
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

// DJS EXAMPLE FOR TESTING PURPOSES

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds]
});

client.on("interactionCreate", i => {
    if (!i.isChatInputCommand()) return;
    commands.execute(i.commandName, i);
});

client.login(token);

commands.setToken(token, "818608310030041128", "668485643487412234");
commands.registerAll();
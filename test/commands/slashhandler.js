import { Command, commands, opts, Adapter, utils } from "../../lib/index.js";
import fs from "node:fs";
import { Client, IntentsBitField } from "discord.js";

const arg1 = opts.int({
    name: "min",
    desc: "The lower bound."
});

const arg2 = opts.int({
    name: "max",
    desc: "The upper bound.",
    autocomplete(interaction) {
        interaction.respond(utils.autocompleteResponse([4, 5, 6]));
    }
});

new Command("random", "Generates a random integer within a range.")
.args`<${arg1}> <${arg2}>`
.adapter(Adapter.DJS)
.log("./test/commands/logs/{name}.client.json")
.execute(i => {
    const min = i.options.getInteger("min");
    const max = i.options.getInteger("max");

    const rand = Math.floor(Math.random() * (max - min + 1)) + min;
    i.reply(`Your random number is ${rand}.`);
});

const token = fs.readFileSync("./test/commands/.env.local").toString("utf8").slice(6);
commands.setToken(token, "818608310030041128", "668485643487412234");
commands.registerAll();

// DJS EXAMPLE FOR TESTING PURPOSES:

const client = new Client({
    intents: [IntentsBitField.Flags.Guilds]
});

client.on("interactionCreate", i => {
    if (i.isChatInputCommand()) {
        commands.execute(i.commandName, i);
    }

    if (i.isAutocomplete()) {
        commands.autocomplete(i.commandName, i.options.getFocused(true).name, i);
    }
});

client.login(token);
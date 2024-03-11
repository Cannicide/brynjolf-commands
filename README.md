# Brynjolf Commands
Easily create, register, and handle Discord slash commands. This system is library-agnostic, allowing you to use nearly the exact same command-handling code for the Discord API as you would for a library such as Discord.js. Built-in support is provided for API interactions and Discord.js interactions via Adapters.

## Features
- 📚 Library-agnostic, can support various libraries and the Discord API
- 🔧 Built-in adapters for Discord API and Discord.js
- 🪶 Lightweight
- 🍰 Easy to use
- 🪆 No heavily nested object literals
- 👥 Registration does not require any additional dependencies
- 🛜 Can register commands with or without handling them
- 🧠 Built with Typescript, providing great IDE intellisense

## Get Started
1. Create a Discord client with your preferred library or with Discord API requests
2. Install Brynjolf Commands with `npm install @brynjolf/commands`
3. Run the quick example below, or skip the tutorial and dive right in

## Quick Example
This is a basic example for Discord.js. When using the Discord API or another library, swap `Adapter.DJS` for `Adapter.API`. When you don't need command handling and only need registration, use `Adapter.REGISTER_ONLY` with an empty `execute()` method.

```js
import { Command, commands, Adapter } from "@brynjolf/commands"

// Create command
new Command("ping", "Returns a pong!")
.adapter(Adapter.DJS)
.execute(i => {
    i.reply("Pong!");
});

// Register commands
commands.setToken(TOKEN, APPLICATION_ID, OPTIONAL_GUILD_ID);
commands.registerAll();

// Discord.js code to handle Brynjolf commands
client.on("interactionCreate", i => {
    if (!i.isChatInputCommand()) return;
    commands.execute(i.commandName, i);
});
```

## Docs
Detailed examples do not exist yet, but will be added soon.

[Primary Features →](modules/Members.html)\
[Typescript Types →](modules/Types.html)\
Examples →
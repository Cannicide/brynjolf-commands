/**
 * Complete unit tests for primary functionality of Syntax and Options systems.
 */



import parse from "../lib/syntax.js";
import opts from "../lib/opts.js";
import { ChannelType } from "discord-api-types/v10";

const testUtils = {
    replaceKey(oldKey, newKey, obj) {
        obj[newKey] = obj[oldKey];
        delete obj[oldKey];
    },
    replaceKeys(keyPairs, obj) {
        for (const pair of keyPairs) this.replaceKey(pair[0], pair[1], obj);
    }
}

// ==== Test subcommands ====

let testsc = opts.subcommand({
    name: "testsc",
    desc: "Testing subcommand syntax."
});

let testarg1 = opts.string({
    name: "testarg1",
    desc: "First test argument.",
    choices: [42, 69]
});

let testarg2 = opts.boolean({
    name: "testarg2",
    desc: "Second, optional test argument."
});

let output = {
    options: parse`${testsc} <${testarg1}> [${testarg2}]`
};

test("Subcommand has generated.", () => {
    expect(output.options[0]?.name).toBe(testsc.get("name"));
});

test("Subcommand has correct args.", () => {
    const sc = output.options[0];

    expect(sc.options).toBeTruthy();
    expect(sc.options.length).toBe(2);
    expect(sc.options[0]?.name).toBe(testarg1.get("name"));
    expect(sc.options[1]?.name).toBe(testarg2.get("name"));
});

// ==== Test subgroups ====

let testsg = opts.subgroup({
    name: "testsg",
    desc: "Testing subgroup syntax."
});

let testsc2 = opts.subcommand({
    name: "testsc",
    desc: "Testing subcommand syntax."
});

let output2 = {
    options: parse`${testsg} ${testsc2} <${testarg1}>`
};

test("Subgroup has generated.", () => {
    expect(output2.options[0]?.name).toBe(testsg.get("name"));
});

test("Subgroup has correct subcommands and args.", () => {
    const sg = output2.options[0];

    expect(sg.options).toBeTruthy();
    expect(sg.options.length).toBe(1);

    const sc = sg.options[0];

    expect(sc).toBeTruthy();
    expect(sc.name).toBe(testsc2.get("name"));
    expect(sc.options).toBeTruthy();
    expect(sc.options.length).toBe(1);
    expect(sc.options[0]?.name).toBe(testarg1.get("name"));
});

// ==== Test arguments ====

const baseTestStructure = {
    name: "basetestarg",
    desc: "Testing base arguments."
};

const baseTestLocalStructure = {
    name: "basetestarg2",
    desc: "Testing base arguments.",
    localName: {
        "en-US": "usbasetestarg"
    },
    localDesc: {
        "en-US": "Testing base arguments in the US."
    }
};

const basetestarg1 = opts.boolean(baseTestStructure);
const basetestarg2 = opts.boolean(baseTestLocalStructure);
const basetestarg3 = opts.boolean({ name: "basetestarg", desc: "A fake replica of the first base test arg." })

const output3 = parse`<${basetestarg1}> <${basetestarg2}> [${basetestarg3}]`;

test("Base args have correct output.", () => {
    const fixedStructure = { ...baseTestStructure };
    testUtils.replaceKey("desc", "description", fixedStructure);

    const fixedLocalStructure = { ...baseTestLocalStructure };
    testUtils.replaceKeys([
        ["desc", "description"],
        ["localDesc", "description_localizations"],
        ["localName", "name_localizations"]
    ], fixedLocalStructure)

    expect(output3[0]).toMatchObject(fixedStructure);
    expect(output3[1]).toMatchObject(fixedLocalStructure);
    expect(output3[2]).not.toMatchObject(fixedStructure);
});

const channelTestStructure = {
    name: "channeltestarg",
    desc: "Testing channel arguments.",
    channelTypes: ["GuildText"]
};

const channeltestarg = opts.channel({
    name: "channeltestarg",
    desc: "Testing channel arguments.",
    channelTypes: ["GuildText"]
})._translate();

test("Channel args have correct output.", () => {
    const fixedStructure = { ...channelTestStructure };
    testUtils.replaceKeys([
        ["desc", "description"],
        ["channelTypes", "channel_types"]
    ], fixedStructure);
    fixedStructure["channel_types"] = [ChannelType[fixedStructure["channel_types"]]];

    expect(channeltestarg).toMatchObject(fixedStructure);
});

const numrangetestarg = opts.number({
    name: "lengthtestarg1",
    desc: "Testing length arguments.",
    range: [1.5, 9],
})._translate();

const strangetestarg = opts.string({
    name: "lengthtestarg2",
    desc: "Testing length arguments.",
    range: [2, 10]
})._translate();

const lengthchoicestestarg = opts.integer({
    name: "lengthtestarg3",
    desc: "Testing length arguments.",
    choices: [1, 5, 9]
})._translate();

test("Length args have correct output.", () => {
    // Number ranges
    expect(numrangetestarg.min_value).toBe(1.5);
    expect(numrangetestarg.max_value).toBe(9);

    // String ranges
    expect(strangetestarg.min_length).toBe(2);
    expect(strangetestarg.max_length).toBe(10);

    // Integer choices
    expect(lengthchoicestestarg.choices.length).toBe(3);
    expect(lengthchoicestestarg.choices[0].name).toBe("1");
    expect(lengthchoicestestarg.choices[1].name).toBe("5");
    expect(lengthchoicestestarg.choices[2].name).toBe("9");
});
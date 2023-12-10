import { ApplicationCommandOptionType, ChannelType, LocalizationMap } from "discord-api-types/v10";

interface ResultOptions {
    name?: string;
    description?: string;
    choices?: any[];
    max_value?: number;
    min_value?: number;
    required?: boolean;
    type: ApplicationCommandOptionType;
    name_localizations?: LocalizationMap;
    description_localizations?: LocalizationMap;
    max_length?: number;
    min_length?: number;
    channel_types?: ChannelType[];
}

interface BaseOptions {
    name?: string;
    desc?: string;
    localName?: LocalizationMap;
    localDesc?: LocalizationMap;
}

interface ChannelOptions extends BaseOptions {
    channelTypes?: Array<keyof typeof ChannelType>;
}

interface LengthOptions extends BaseOptions {
    range?: [number?, number?];
    choices?: any[];
}

class BrynjolfArgumentTranslator {

    private data: ResultOptions;
    private opts: BaseOptions|ChannelOptions|LengthOptions;

    constructor(type: ApplicationCommandOptionType, opts: BaseOptions|ChannelOptions|LengthOptions) {
        this.data = {
            type
        };

        this.opts = opts;
    }

    public name(name?: string) { this.data.name ??= name; }
    public desc(desc?: string) { this.data.description ??= desc; }
    public choices(choices?: any[]) { this.data.choices ??= choices; }
    public range(range?: [number?, number?]) {
        if (!this.isLength(this.opts)) return;

        let min = range?.[0] ?? undefined;
        let max = range?.[1] ?? undefined;
        if (this.data.type == ApplicationCommandOptionType.String) {
            this.data.min_length ??= min;
            this.data.max_length ??= max;
        }
        else {
            this.data.min_value ??= min;
            this.data.max_value ??= max;
        }
    }
    public required(required?: boolean) { this.data.required ??= required; }
    public localName(names?: LocalizationMap) { this.data.name_localizations ??= names; }
    public localDesc(descs?: LocalizationMap) { this.data.description_localizations ??= descs; }
    public channelTypes(types?: Array<keyof typeof ChannelType>) { this.data.channel_types ??= types?.map(key => ChannelType[key]); }

    private isChannel(x: BaseOptions|ChannelOptions|LengthOptions): x is ChannelOptions {
        return "channelTypes" in x;
    }

    private isLength(x: BaseOptions|ChannelOptions|LengthOptions): x is LengthOptions {
        return "range" in x || "choices" in x;
    }

    /**
     * @private
     */
    public _translate(): ResultOptions {
        this.name(this.opts.name);
        this.desc(this.opts.desc);
        this.localName(this.opts.localName);
        this.localDesc(this.opts.localDesc);

        if (this.isChannel(this.opts)) {
            this.channelTypes(this.opts.channelTypes);
        }

        if (this.isLength(this.opts)) {
            this.choices(this.opts.choices);
            this.range(this.opts.range);
        }

        return this.data;
    }

}

const BrynjolfOptions = {

    file(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Attachment, opts);
    },

    boolean(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Boolean, opts);
    },

    channel(opts: ChannelOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Channel, opts);
    },

    integer(opts: LengthOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Integer, opts);
    },

    mention(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Mentionable, opts);
    },

    number(opts: LengthOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Number, opts);
    },

    role(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Role, opts);
    },

    string(opts: LengthOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.String, opts);
    },

    user(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.User, opts);
    },

    subcommand(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Subcommand, opts);
    },

    subgroup(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.SubcommandGroup, opts);
    }

};

export default BrynjolfOptions;
export { BaseOptions, LengthOptions, ChannelOptions, BrynjolfArgumentTranslator };
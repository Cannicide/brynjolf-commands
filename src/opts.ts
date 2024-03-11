import { ApplicationCommandOptionType, ChannelType, LocalizationMap } from "discord-api-types/v10";

interface ResultOptions {
    name?: string;
    description?: string;
    choices?: {[choice: string]: any}[];
    max_value?: number;
    min_value?: number;
    required?: boolean;
    type: ApplicationCommandOptionType;
    _brynjolf_type: string;
    name_localizations?: LocalizationMap;
    description_localizations?: LocalizationMap;
    max_length?: number;
    min_length?: number;
    channel_types?: ChannelType[];
    options?: ResultOptions[];
    autocomplete?: boolean;
}

interface BaseOptions {
    name: string;
    desc: string;
    localName?: LocalizationMap;
    localDesc?: LocalizationMap;
    req?: boolean;
}

interface ChannelOptions extends BaseOptions {
    channelTypes?: Array<keyof typeof ChannelType>;
}

interface LengthOptions extends BaseOptions {
    range?: [number?, number?];
    choices?: string[]|number[];
    autocomplete?: boolean;
}

class BrynjolfArgumentTranslator {

    private data: ResultOptions;
    private opts: BaseOptions|ChannelOptions|LengthOptions;

    constructor(type: ApplicationCommandOptionType, opts: BaseOptions|ChannelOptions|LengthOptions) {
        this.data = {
            type,
            _brynjolf_type: ApplicationCommandOptionType[type]
        };

        this.opts = opts;
    }

    public clone() {
        return new BrynjolfArgumentTranslator(this.data.type, this.opts);
    }

    public name(name?: string) { this.data.name ??= name; }
    public desc(desc?: string) { this.data.description ??= desc; }
    public choices(choices?: string[]|number[]) { 
        this.data.choices ??= choices?.map(c => ({name: c.toString(), value: c}));
    }
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
    public suboptions(options?: BrynjolfArgumentTranslator[]) { this.data.options ??= options?.map(opt => opt._translate()); }
    public autocomplete(enabled?: boolean) { this.data.autocomplete ??= enabled; }
    
    public get(property: (keyof BaseOptions)|(keyof ChannelOptions)|(keyof LengthOptions)): any {
        return this.opts[property as keyof (BaseOptions|ChannelOptions|LengthOptions)];
    }

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
        this.required(this.opts.req);

        if (this.isChannel(this.opts)) {
            this.channelTypes(this.opts.channelTypes);
        }

        if (this.isLength(this.opts)) {
            this.choices(this.opts.choices);
            this.range(this.opts.range);
            this.autocomplete(this.opts.autocomplete);
        }

        return this.data;
    }

}

const BrynjolfOptions = {

    /**
     * File option
     */
    file(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Attachment, opts);
    },

    /**
     * Boolean option
     */
    bool(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Boolean, opts);
    },

    /**
     * Channel option
     */
    chnl(opts: ChannelOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Channel, opts);
    },

    /**
     * Integer option
     */
    int(opts: LengthOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Integer, opts);
    },

    /**
     * Ping/Mention option
     */
    ping(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Mentionable, opts);
    },

    /**
     * Number/Float option
     */
    num(opts: LengthOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Number, opts);
    },

    /**
     * Role option
     */
    role(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Role, opts);
    },

    /**
     * String option
     */
    str(opts: LengthOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.String, opts);
    },

    /**
     * User option
     */
    user(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.User, opts);
    },

    /**
     * Subcommand option
     */
    subc(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.Subcommand, opts);
    },

    /**
     * Subgroup option
     */
    subg(opts: BaseOptions) {
        return new BrynjolfArgumentTranslator(ApplicationCommandOptionType.SubcommandGroup, opts);
    }

};

export default BrynjolfOptions;
export { BaseOptions, LengthOptions, ChannelOptions, ResultOptions, BrynjolfArgumentTranslator };
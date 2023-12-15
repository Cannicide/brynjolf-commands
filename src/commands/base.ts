import { ApplicationCommandType, LocalizationMap } from "discord-api-types/v10";

interface BaseCommandOptions {
    name: string;
    description: string;
    type: ApplicationCommandType;
    name_localizations?: LocalizationMap;
    description_localizations?: LocalizationMap;
    default_member_permissions?: string;
    dm_permission?: boolean;
    nsfw?: boolean;
}

export default BaseCommandOptions;
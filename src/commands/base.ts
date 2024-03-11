import { ApplicationCommandType, LocalizationMap } from "discord-api-types/v10";

/**
 * Discord API-compatible object capable of representing
 * commands of all types.
 */
interface BaseCommandData {
    /** Name of the command. */
    name: string;
    /** Description of the command. */
    description: string;
    /** Type of the command. */
    type: ApplicationCommandType;
    /** Map of locales to localized command names. */
    name_localizations?: LocalizationMap;
    /** Map of locales to localized command descriptions. */
    description_localizations?: LocalizationMap;
    /** Default permissions required for the command. */
    default_member_permissions?: string;
    /** Whether the command can be used in DMs. */
    dm_permission?: boolean;
    /** Whether the command is NSFW (not safe for work). */
    nsfw?: boolean;
}

export default BaseCommandData;
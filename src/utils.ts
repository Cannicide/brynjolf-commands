import type { AutocompleteSuggestion } from "./exports/types.js";

/** Utility methods to use with \@brynjolf/commands. */
const utils = {
    /** Converts a list of autocomplete results to a list of API-compatible response objects. */
    autocompleteResponse(data: (string|number)[]): AutocompleteSuggestion[] {
        return data.map(value => ({ name: value.toString(), value }));
    }
}

export default utils;
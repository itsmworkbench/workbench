import { makeContextForState } from "@itsmworkbench/react_utils";
import { getAllPaths, pathToValue } from "@itsmworkbench/record_utils";

export type Language = string

export const { use: useLanguage, Provider: LanguageProvider } = makeContextForState<Language, "language">("language");

/**
 * Validates translation objects across multiple languages.
 *
 * @param translations - A record where each key is a language and its value is the translation object.
 * @returns An object mapping each language to its missing keys and keys with non-string values.
 */
export function validateTranslations(translations: Record<Language, Record<string, any>>) {
    const languages = Object.keys(translations);
    const keys = languages.map(lang => getAllPaths(translations[lang]));
    const allKeys = new Set(keys.flat());
    const errors = Object.fromEntries(languages.map((lang, i) => {
        const missing = Array.from(allKeys).filter(key => !keys[i].includes(key));
        const notStrings: string[] = [];
        for (const path of keys[i]) {
            if (typeof pathToValue(translations[lang], path) !== "string") {
                notStrings.push(path);
            }
        }
        return [lang, { missing, notStrings }];

    }));
    return errors;
}
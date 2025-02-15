import React, {createContext, useCallback, useContext} from "react";
import {toCamelCase} from "@itsmworkbench/utils";
import {makeContextForState} from "@itsmworkbench/react_utils";

export type RawTranslationFn = (key: string) => string | undefined;
export type TranslationFn = (key: string) => string;

// Default function to transform keys into readable labels
export const defaultTranslationFn: TranslationFn = toCamelCase;

export function emptyUsedAndNotFound(): UsedAndNotFound {
    return { used: new Set(), notFound: new Set(), errors: new Set() };
}
export type UsedAndNotFound = {
    used: Set<string>;
    notFound: Set<string>;
    errors: Set<string>;
};

// Create context for tracking translation usage and errors
export const { use: useTranslationUsedAndNotFound, Provider: TranslationUsedAndNotFoundProvider } =
    makeContextForState<UsedAndNotFound, "usedAndNotFound">("usedAndNotFound", true);

// Context to provide the translation function
export const TranslationContext = createContext<TranslationFn>(defaultTranslationFn);

export type TranslationProviderProps = {
    translationFn: RawTranslationFn;
    defaultFn?: TranslationFn;
    children: React.ReactNode;
};

// Default function for missing translations
export function NotFoundTranslationFn(key: string): string {
    return `${key}.not.found`;
}

// Reusable function to update translation tracking state
function updateSetInState(
    key: string,
    type: keyof UsedAndNotFound,
    setUsedAnd: (updateFn: (prev: UsedAndNotFound) => UsedAndNotFound) => void
) {
    setTimeout(() => {
        setUsedAnd((prev) => {
            const newSet = new Set(prev[type]);
            newSet.add(key);
            const result = { ...prev, [type]: newSet };
            return result;
        });
    }, 0);
}

export function TranslationProvider({
                                        translationFn,
                                        children,
                                        defaultFn = NotFoundTranslationFn,
                                    }: TranslationProviderProps) {
    const ops = useTranslationUsedAndNotFound();

    const translation: TranslationFn = useCallback(
        (key: string) => {
            const result = translationFn(key);

            if (ops) {
                const [usedAnd, setUsedAnd] = ops;

                if (result === undefined) {
                    if (!usedAnd.notFound.has(key)) {
                        updateSetInState(key, "notFound", setUsedAnd);
                    }
                } else {
                    if (!usedAnd.used.has(key)) {
                        updateSetInState(key, "used", setUsedAnd);
                    }
                    if (typeof result !== "string" && !usedAnd.errors.has(key)) {
                        updateSetInState(key, "errors", setUsedAnd);
                    }
                }
            }

            // Return the result or default fallback if translation not found
            return result === undefined
                ? defaultFn(key)
                : typeof result === "string"
                    ? result
                    : `${key}.error`;
        },
        [translationFn, defaultFn, ops]
    );

    return <TranslationContext.Provider value={translation}>{children}</TranslationContext.Provider>;
}

// Hook to consume the translation function
export function useTranslation(): TranslationFn {
    return useContext(TranslationContext);
}

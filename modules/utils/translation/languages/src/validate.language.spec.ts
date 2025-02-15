import { Language, validateTranslations } from "./language";

describe("validateTranslations", () => {
    test("should return no errors when all languages have the same keys with string values", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                greeting: "Hello",
                farewell: "Goodbye",
            },
            fr: {
                greeting: "Bonjour",
                farewell: "Au revoir",
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: [] },
            fr: { missing: [], notStrings: [] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should identify missing keys in a language", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                greeting: "Hello",
                farewell: "Goodbye",
                welcome: "Welcome",
            },
            fr: {
                greeting: "Bonjour",
                farewell: "Au revoir",
                // 'welcome' key is missing
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: [] },
            fr: { missing: ["welcome"], notStrings: [] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should identify keys with non-string values", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                greeting: "Hello",
                farewell: "Goodbye",
                count: 5, // Non-string value
            },
            fr: {
                greeting: "Bonjour",
                farewell: "Au revoir",
                count: "Cinq",
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: ["count"] },
            fr: { missing: [], notStrings: [] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should identify both missing keys and non-string values", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                greeting: "Hello",
                farewell: "Goodbye",
                count: 5, // Non-string value
                welcome: "Welcome",
            },
            fr: {
                greeting: "Bonjour",
                // 'farewell' key is missing
                count: "Cinq",
                welcome: 10, // Non-string value
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: ["count"] },
            fr: { missing: ["farewell"], notStrings: ["welcome"] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should handle empty translations object", () => {
        const translations: Record<Language, Record<string, any>> = {};

        const expectedErrors: Record<Language, { missing: string[]; notStrings: string[] }> = {};

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should handle single language with all correct keys", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                greeting: "Hello",
                farewell: "Goodbye",
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: [] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should handle nested keys correctly", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                home: {
                    title: "Home",
                    welcomeMessage: "Welcome to the homepage",
                },
                about: {
                    title: "About Us",
                },
            },
            fr: {
                home: {
                    title: "Accueil",
                    // 'welcomeMessage' is missing
                },
                about: {
                    title: "À propos de nous",
                },
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: [] },
            fr: { missing: ["home.welcomeMessage"], notStrings: [] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should handle multiple languages with varying keys and types", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                greeting: "Hello",
                farewell: "Goodbye",
                home: {
                    title: "Home",
                    description: "Welcome home!",
                },
                errors: {
                    notFound: "Page not found",
                },
            },
            fr: {
                greeting: "Bonjour",
                farewell: "Au revoir",
                home: {
                    title: "Accueil",
                    // 'description' is missing
                },
                errors: {
                    notFound: "Page non trouvée",
                    serverError: "Erreur du serveur", // Extra key
                },
            },
            es: {
                greeting: "Hola",
                // 'farewell' is missing
                home: {
                    title: "Inicio",
                    description: 123, // Non-string value
                },
                errors: {
                    notFound: "Página no encontrada",
                },
            },
        };

        const expectedErrors = {
            en: { missing: ["errors.serverError"], notStrings: [] },
            fr: { missing: ["home.description"], notStrings: [] },
            es: { missing: ["farewell", "errors.serverError"], notStrings: ["home.description"] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should handle translations with deeply nested keys", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                dashboard: {
                    user: {
                        name: "User Name",
                        settings: {
                            theme: "dark",
                            notifications: true, // Non-string value
                        },
                    },
                },
            },
            fr: {
                dashboard: {
                    user: {
                        name: "Nom d'utilisateur",
                        settings: {
                            theme: "sombre",
                            // 'notifications' key is missing
                        },
                    },
                },
            },
            de: {
                dashboard: {
                    user: {
                        name: "Benutzername",
                        settings: {
                            theme: "dunkel",
                            notifications: "aktiviert",
                        },
                    },
                },
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: ["dashboard.user.settings.notifications"] },
            fr: { missing: ["dashboard.user.settings.notifications"], notStrings: [] },
            de: { missing: [], notStrings: [] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should handle translations with empty objects", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                emptyObjectEn: {},

                validKey: "Valid",
            },
            fr: {
                emptyObjectFr: {},
                validKey: "Valide",
            },
            es: {
                emptyObjectEs: {},
                validKey: "", // Empty string is still a string
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: [] },
            fr: { missing: [], notStrings: [] },
            es: { missing: [], notStrings: [] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });

    test("should handle translations with null and undefined values", () => {
        const translations: Record<Language, Record<string, any>> = {
            en: {
                greeting: "Hello",
                farewell: null, // Non-string value
                welcome: undefined, // Non-string value
            },
            fr: {
                greeting: "Bonjour",
                farewell: "Au revoir",
                welcome: "Bienvenue",
            },
        };

        const expectedErrors = {
            en: { missing: [], notStrings: ["farewell", "welcome"] },
            fr: { missing: [], notStrings: [] },
        };

        const result = validateTranslations(translations);
        expect(result).toEqual(expectedErrors);
    });
});

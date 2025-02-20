import React, {act} from "react";
import {render, screen} from "@testing-library/react";


import "@testing-library/jest-dom";
import {AttributeValueProvider, SimpleAttributeValueLayout, SimpleDataLayout} from "@itsmworkbench/renderers";
import {allRenderers} from "@itsmworkbench/all_renderers";

import {LanguageProvider} from "@itsmworkbench/language";
import {RawThemeProvider, themeForTests} from "@itsmworkbench/themes";
import {TranslationUsedAndNotFoundProvider} from "./translation";
import {DevModeTranslate} from "./devmode.translate";


// Create a wrapper provider that includes both the translation and renderer context
function TestProvider({ children, initialState }: { children: React.ReactNode; initialState: any }) {
    return (
        <LanguageProvider language={"de"}>
            <RawThemeProvider theme={themeForTests}>
                <AttributeValueProvider renderers={allRenderers} AttributeValueLayout={SimpleAttributeValueLayout} DataLayout={SimpleDataLayout}>
                    <TranslationUsedAndNotFoundProvider usedAndNotFound={initialState}>
                        {children}
                    </TranslationUsedAndNotFoundProvider>
                </AttributeValueProvider>
            </RawThemeProvider>
        </LanguageProvider>
    );
}

describe("DevModeTranslate Component", () => {
    const initialState = {
        used: new Set(["key1", "key2"]),
        notFound: new Set(["missingKey"]),
        errors: new Set(["errorKey"]),
    };

    test("renders JSON values for used, notFound, and errors when provider is available", async () => {
        await act(async () => {
            render(
                <TestProvider initialState={initialState}>
                    <DevModeTranslate />
                </TestProvider>,
            );
        });

        // Verify 'used' translations are rendered
        const usedElement = screen.getByTestId("dev-mode-translate-devmode.translation.used");
        expect(usedElement).toHaveTextContent("[ \"key1\", \"key2\" ]");

        // Verify 'notFound' translations are rendered
        const notFoundElement = screen.getByTestId("dev-mode-translate-devmode.translation.notFound");
        expect(notFoundElement).toHaveTextContent("[ \"missingKey\" ]");

        // Verify 'errors' translations are rendered
        const errorsElement = screen.getByTestId("dev-mode-translate-devmode.translation.errors");
        expect(errorsElement).toHaveTextContent("[ \"errorKey\" ]");
    });


    test("renders empty sets correctly", async () => {
        const emptyState = {
            used: new Set(),
            notFound: new Set(),
            errors: new Set(),
        };

        await act(async () => {
            render(
                <TestProvider initialState={emptyState}>
                    <DevModeTranslate />
                </TestProvider>,
            );
        });

        const usedElement = screen.getByTestId("dev-mode-translate-devmode.translation.used");
        expect(usedElement).toHaveTextContent(JSON.stringify([], null, 2));

        const notFoundElement = screen.getByTestId("dev-mode-translate-devmode.translation.notFound");
        expect(notFoundElement).toHaveTextContent(JSON.stringify([], null, 2));

        const errorsElement = screen.getByTestId("dev-mode-translate-devmode.translation.errors");
        expect(errorsElement).toHaveTextContent(JSON.stringify([], null, 2));
    });
});

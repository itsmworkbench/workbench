import React from "react";
import {render, screen} from "@testing-library/react";
import {Theme, themeForTests, ThemeProvider, ThemeProviderProps, useTheme} from "./themes";
import "@testing-library/jest-dom";
import {FeatureFlags, FeatureFlagsStateProvider, ThrowErrorProvider} from "@itsmworkbench/react_utils";

// TestThemeConsumer component to consume and display theme properties
const TestThemeConsumer: React.FC = () => {
    const theme = useTheme();

    return (
        <div>
            <p data-testid="theme-name">{theme.name}</p>
            <p data-testid="header-logo-url">{theme.header.logoUrl}</p>
            <p data-testid="renderer-h1-color" style={{color: theme.renderer.h1WithUrl.color}}>
                {theme.renderer.h1WithUrl.color}
            </p>
        </div>
    );
};
const featureFlags = (value: string): FeatureFlags => ({theme: {value, options: ["default"], description: "default desc"}});


describe("ThemeProvider", () => {
    const themes: Record<string, Theme> = {
        default: themeForTests,
        dark: {
            ...themeForTests,
            name: "dark theme",
            renderer: {
                ...themeForTests.renderer,
                h1WithUrl: {
                    ...themeForTests.renderer.h1WithUrl,
                    color: "#ffffff",
                },
                text: {
                    ...themeForTests.renderer.text,
                    color: "#ffffff",
                },
            },
        },
        light: {
            ...themeForTests,
            name: "light theme",
            renderer: {
                ...themeForTests.renderer,
                h1WithUrl: {
                    ...themeForTests.renderer.h1WithUrl,
                    color: "#000000",
                },
                text: {
                    ...themeForTests.renderer.text,
                    color: "#000000",
                },
            },
        },
    };

    const renderWithTheme = (
        featureFlags: FeatureFlags,
        logError: (errorCode: string, message: string) => never = () => { throw new Error("Should not have been called"); },
        themesRecord: Record<string, Theme> = themes,
    ) => {
        const props: ThemeProviderProps = {
            themes: themesRecord,
            children: <TestThemeConsumer/>,
        };
        return render(
            <FeatureFlagsStateProvider featureFlags={featureFlags}>
                <ThrowErrorProvider logError={logError}>
                    <ThemeProvider {...props} />
                </ThrowErrorProvider>
            </FeatureFlagsStateProvider>
        );
    };

    it("provides the default theme when feature flag is \"default\"", () => {
        renderWithTheme(featureFlags("default"));
        // Updated expected values according to the new themeForTests values
        expect(screen.getByTestId("theme-name")).toHaveTextContent("test theme");
        expect(screen.getByTestId("header-logo-url")).toHaveTextContent("someLogoUrl");
        expect(screen.getByTestId("renderer-h1-color")).toHaveTextContent("#262626");
    });


    it("overrides the theme based on the feature flag", () => {

        renderWithTheme(featureFlags("dark"));

        expect(screen.getByTestId("theme-name")).toHaveTextContent("dark theme");
        expect(screen.getByTestId("header-logo-url")).toHaveTextContent("someLogoUrl"); // Assuming header remains the same
        expect(screen.getByTestId("renderer-h1-color")).toHaveTextContent("#ffffff");
    });


    it("renders children correctly", () => {

        renderWithTheme(featureFlags("default"));

        expect(screen.getByTestId("theme-name")).toBeInTheDocument();
        expect(screen.getByTestId("header-logo-url")).toBeInTheDocument();
        expect(screen.getByTestId("renderer-h1-color")).toBeInTheDocument();
    });

    it("provides the correct theme when feature flag is set to \"light\"", () => {

        renderWithTheme(featureFlags("light"));

        expect(screen.getByTestId("theme-name")).toHaveTextContent("light theme");
        expect(screen.getByTestId("renderer-h1-color")).toHaveTextContent("#000000");
        expect(screen.getByTestId("renderer-h1-color")).not.toHaveTextContent("#262626");
    });

    it("falls back to the default theme if the feature flag is missing", () => {

        renderWithTheme(featureFlags(undefined as any));

        // Assuming the ThemeProvider falls back to the default theme when the feature flag is missing
        expect(screen.getByTestId("theme-name")).toHaveTextContent("test theme");
        expect(screen.getByTestId("renderer-h1-color")).toHaveTextContent("#262626");
    });
});

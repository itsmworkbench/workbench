import {render, screen, fireEvent} from "@testing-library/react";
import React from "react";


import {DevModeFeatureFlags} from "./devmode.feature.flags";
import '@testing-library/jest-dom';
import { FeatureFlagsStateProvider } from "@itsmworkbench/react_utils";

describe("DevModeFeatureFlags Component", () => {
    const initialFeatureFlags = {
        darkMode: {value: true, description: "Enable dark mode"},
        betaFeatures: {value: false, description: "Enable beta features"},
        logging: {value: true, description: "Enable verbose logging"},
    };

    const renderWithProviders = (ui: React.ReactNode, url: URL = new URL("https://example.com/")) => {
        return render(
            <FeatureFlagsStateProvider featureFlags={initialFeatureFlags}>
                {ui}
            </FeatureFlagsStateProvider>
        );
    };

    it("renders feature flags with correct initial state", () => {
        renderWithProviders(<DevModeFeatureFlags/>);

        expect(screen.getByLabelText(": Enable dark mode")).toBeChecked();
        expect(screen.getByLabelText(": Enable beta features")).not.toBeChecked();
        expect(screen.getByLabelText(": Enable verbose logging")).toBeChecked();
    });

    it("updates feature flags when toggled", () => {
        renderWithProviders(<DevModeFeatureFlags/>);

        const betaCheckbox = screen.getByLabelText(": Enable beta features");
        expect(betaCheckbox).not.toBeChecked();

        fireEvent.click(betaCheckbox);

        expect(betaCheckbox).toBeChecked();
    });


});

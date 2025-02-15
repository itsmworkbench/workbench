// src/devmode.debug.test.tsx

import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { DevModeDebug } from "./devmode.debug";
import { jest } from "@jest/globals";
import { RawThemeProvider, themeForTests } from "@itsmworkbench/themes";
import { AttributeValueProvider, SimpleAttributeValueLayout, SimpleDataLayout } from "@itsmworkbench/renderers";
import { allRenderers } from "@itsmworkbench/all_renderers";
import { DebugStateProvider } from "@itsmworkbench/react_utils";

// Mock react-markdown to render children directly
jest.mock("react-markdown", () => (props: any) => <div>{props.children}</div>);

/**
 * Helper function to render DevModeDebug component with necessary providers.
 *
 * @param initialState - The initial debug state for the DebugStateProvider.
 */
function renderComponent(initialState: Record<string, boolean>) {
    return render(
        <RawThemeProvider theme={themeForTests}>
            <AttributeValueProvider
                renderers={allRenderers}
                AttributeValueLayout={SimpleAttributeValueLayout}
                DataLayout={SimpleDataLayout}
            >
                <DebugStateProvider debugState={initialState}>
                    <DevModeDebug />
                </DebugStateProvider>
            </AttributeValueProvider>
        </RawThemeProvider>,
    );
}

describe("DevModeDebug Component", () => {
    it("renders checkboxes for each debug state", () => {
        const initialState = {
            search: true,
            state: false,
            login: true,
        };

        renderComponent(initialState);

        // Check for all debug keys and their initial states
        const searchCheckbox = screen.getByLabelText("search") as HTMLInputElement;
        const stateCheckbox = screen.getByLabelText("state") as HTMLInputElement;
        const loginCheckbox = screen.getByLabelText("login") as HTMLInputElement;

        expect(searchCheckbox).toBeInTheDocument();
        expect(searchCheckbox).toBeChecked();

        expect(stateCheckbox).toBeInTheDocument();
        expect(stateCheckbox).not.toBeChecked();

        expect(loginCheckbox).toBeInTheDocument();
        expect(loginCheckbox).toBeChecked();
    });

    it("updates debug state when checkboxes are toggled", () => {
        const initialState = {
            search: false,
            state: true,
            login: false,
        };

        renderComponent(initialState);

        const searchCheckbox = screen.getByLabelText("search") as HTMLInputElement;
        const stateCheckbox = screen.getByLabelText("state") as HTMLInputElement;
        const loginCheckbox = screen.getByLabelText("login") as HTMLInputElement;

        // Toggle checkboxes
        fireEvent.click(searchCheckbox); // From false to true
        fireEvent.click(stateCheckbox);  // From true to false
        fireEvent.click(loginCheckbox);  // From false to true

        // Assert updated states
        expect(searchCheckbox).toBeChecked();
        expect(stateCheckbox).not.toBeChecked();
        expect(loginCheckbox).toBeChecked();
    });

    it("displays raw debug state in the preformatted section", () => {
        const initialState = {
            search: true,
            state: true,
            login: false,
        };

        renderComponent(initialState);

        // Assuming the raw debug state is displayed in a <pre> or similar element
        const rawDebugOutput = screen.getByTestId("debug-debug");
        expect(rawDebugOutput).toBeInTheDocument();
        expect(rawDebugOutput).toHaveTextContent("\"search\": true");
        expect(rawDebugOutput).toHaveTextContent("\"state\": true");
        expect(rawDebugOutput).toHaveTextContent("\"login\": false");
    });
});

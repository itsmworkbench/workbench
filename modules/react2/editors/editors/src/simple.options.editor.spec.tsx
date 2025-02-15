// simple.options.editor.spec.tsx

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SimpleOptionsEditor, OptionsProps } from "./simple.options.editor";
import { GetterSetter } from "@itsmworkbench/react_utils";
import { TranslationProvider } from "@itsmworkbench/translation";


describe("SimpleOptionsEditor", () => {
    const mockSetter = jest.fn();

    const renderComponent = <T, >({
                                      rootId,
                                      attribute,
                                      ops,
                                      options,
                                      stringify,
                                      showClear,
                                      selectLabel,
                                      ariaLabel,
                                  }: OptionsProps<T> & { selectLabel?: string; ariaLabel?: string }) => {
        return render(
            <TranslationProvider translationFn={(key: string) => key + "-translated"}>
                <SimpleOptionsEditor<T>
                    rootId={rootId}
                    attribute={attribute}
                    ops={ops}
                    options={options}
                    stringify={stringify}
                    showClear={showClear}
                    selectLabel={selectLabel}
                    ariaLabel={ariaLabel}
                />
            </TranslationProvider>,
        );
    };

    beforeEach(() => {
        mockSetter.mockClear();
    });

    // Tests for ariaLabel
    describe("ariaLabel Functionality", () => {
        it("includes aria-label when ariaLabel prop is provided", () => {
            const options = ["Option 1", "Option 2", "Option 3"];
            const currentValue: GetterSetter<string> = ["Option 2", mockSetter];

            renderComponent<string>({
                rootId: "testRoot",
                attribute: "selection",
                ops: currentValue,
                options,
                ariaLabel: "Select an option",
            });

            const select = screen.getByTestId("testRoot-selection");
            expect(select).toBeInTheDocument();
            expect(select).toHaveAttribute("aria-label", "Select an option");
        });

        it("does not include aria-label when ariaLabel prop is not provided", () => {
            const options = ["Option 1", "Option 2", "Option 3"];
            const currentValue: GetterSetter<string> = ["Option 2", mockSetter];

            renderComponent<string>({
                rootId: "testRoot",
                attribute: "selection",
                ops: currentValue,
                options,
                // ariaLabel is omitted
            });

            const select = screen.getByTestId("testRoot-selection");
            expect(select).toBeInTheDocument();
            expect(select).not.toHaveAttribute("aria-label");
        });
    });

    // Tests for selectLabel
    describe("selectLabel Functionality", () => {
        it("includes selectLabel when selectLabel prop is provided", () => {
            const options = ["Option 1", "Option 2", "Option 3"];
            const currentValue: GetterSetter<string> = ["someValue", mockSetter];
            const selectLabelKey = "select-label"; // Key for translation

            renderComponent<string>({
                rootId: "testRoot",
                attribute: "selection",
                ops: currentValue,
                options,
                selectLabel: selectLabelKey,
                showClear: "clear-button",
            });

            const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
            expect(select).toBeInTheDocument();
            expect(select).toHaveValue("");

            // Check if the selectLabel option is present and disabled
            const selectLabelOption = screen.getByText("select-label-translated");
            expect(selectLabelOption).toBeInTheDocument();
            expect(selectLabelOption).toBeDisabled();

            // Ensure selectLabel is the first option
            expect(select.options[0].text).toBe("select-label-translated");
        });

        it("does not include selectLabel when selectLabel prop is not provided", () => {
            const options = ["Option 1", "Option 2", "Option 3"];
            const currentValue: GetterSetter<string> = ["someValue", mockSetter];
            // selectLabel is omitted

            renderComponent<string>({
                rootId: "testRoot",
                attribute: "selection",
                ops: currentValue,
                options,
                showClear: "clear-button",
                // selectLabel is omitted
            });

            const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
            expect(select).toBeInTheDocument();
            expect(select).toHaveValue("");

            // Ensure selectLabel option is not present
            expect(screen.queryByText("select-label-translated")).not.toBeInTheDocument();

            // Only clear options should be present
            expect(select.options.length).toBe(5); // '----' and 'clear-button-translated'
        });
    });

    // Existing Tests
    it("renders options correctly with current value", () => {
        const options = ["Option 1", "Option 2", "Option 3"];
        const currentValue: GetterSetter<string> = ["Option 2", mockSetter];

        renderComponent<string>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
        });

        const select = screen.getByTestId("testRoot-selection");
        expect(select).toBeInTheDocument();
        expect(select).toHaveValue("Option 2");

        options.forEach(option => {
            expect(screen.getByText(option)).toBeInTheDocument();
        });
    });

    it("calls setValue when a different option is selected", () => {
        const options = ["Option 1", "Option 2", "Option 3"];
        const currentValue: GetterSetter<string> = ["Option 1", mockSetter];

        renderComponent<string>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
        });

        const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
        fireEvent.change(select, { target: { value: "Option 3" } });

        expect(mockSetter).toHaveBeenCalledWith("Option 3");
    });

    it("renders clear option when showClear is provided and clears selection", () => {
        const options = ["Option 1", "Option 2", "Option 3"];
        const currentValue: GetterSetter<string> = ["Option 1", mockSetter];

        renderComponent<string>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
            showClear: "clear-button",
        });

        const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
        expect(screen.getByText("----")).toBeInTheDocument();
        expect(screen.getByText("clear-button-translated")).toBeInTheDocument();

        // Select the clear option
        fireEvent.change(select, { target: { value: "" } });

        expect(mockSetter).toHaveBeenCalledWith(null);
    });

    it("handles null value by rendering no selection", () => {
        const options = ["Option 1", "Option 2", "Option 3"];
        const currentValue: GetterSetter<string> = ["someValue", mockSetter];

        renderComponent<string>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
            showClear: "clear-button",
        });

        const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
        expect(select).toHaveValue("");
    });

    it("uses custom stringify function for rendering options", () => {
        type OptionType = { id: number; name: string };
        const options: OptionType[] = [
            { id: 1, name: "Alpha" },
            { id: 2, name: "Beta" },
            { id: 3, name: "Gamma" },
        ];
        const currentValue: GetterSetter<any> = [{ id: 2, name: "Beta" }, mockSetter];

        const stringify = (o: OptionType, i: number) => `${o.id} - ${o.name}`;

        renderComponent<OptionType>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
            stringify,
        });

        const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
        expect(select).toHaveValue("2 - Beta");

        options.forEach(option => {
            expect(screen.getByText(`${option.id} - ${option.name}`)).toBeInTheDocument();
        });
    });

    it("renders without stringify function by default", () => {
        const options = [1, 2, 3];
        const currentValue: GetterSetter<number> = [2, mockSetter];

        renderComponent<number>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
        });

        const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
        expect(select).toHaveValue("2");

        options.forEach(option => {
            expect(screen.getByText(option.toString())).toBeInTheDocument();
        });
    });

    it("renders 'No options available' when options array is empty", () => {
        const options: string[] = [];
        const currentValue: GetterSetter<string> = ["someValue", mockSetter];

        renderComponent<string>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
            showClear: "clear-button",
        });

        const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
        expect(select).toBeInTheDocument();

        // Since options are empty, only clear options should be present
        expect(select.options.length).toBe(2); // '----' and 'clear-button-translated'
    });

    it("renders correctly when value is not in options", () => {
        const options = ["Option 1", "Option 2", "Option 3"];
        const currentValue: GetterSetter<string> = ["Option 4", mockSetter];

        renderComponent<string>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
            showClear: "clear-button",
        });

        const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
        expect(select).toHaveValue("");
    });


    it("handles duplicate stringified values gracefully", () => {
        type OptionType = { id: number; label: string };
        const options: OptionType[] = [
            { id: 1, label: "Duplicate" },
            { id: 2, label: "Duplicate" },
        ];
        const currentValue: GetterSetter<any> = [{ id: 1, label: "Duplicate" }, mockSetter];

        const stringify = (o: OptionType) => o.label;

        renderComponent<OptionType>({
            rootId: "testRoot",
            attribute: "selection",
            ops: currentValue,
            options,
            stringify,
        });

        const select = screen.getByTestId("testRoot-selection") as HTMLSelectElement;
        expect(select).toHaveValue("Duplicate");

        // Select the second duplicate
        fireEvent.change(select, { target: { value: "Duplicate" } });

        // Expect the setter to be called with the first match (id: 1)
        expect(mockSetter).toHaveBeenCalledWith(options[0]);
    });

    it("renders correctly with non-string option types without stringify", () => {
        const options = [1, 2, 3];
        const currentValue: GetterSetter<number> = [2, mockSetter];

        renderComponent<number>({
            rootId: "testRoot",
            attribute: "numberSelection",
            ops: currentValue,
            options,
        });

        const select = screen.getByTestId("testRoot-numberSelection") as HTMLSelectElement;
        expect(select).toHaveValue("2");

        options.forEach(option => {
            expect(screen.getByText(option.toString())).toBeInTheDocument();
        });

        // Change selection to 3
        fireEvent.change(select, { target: { value: "3" } });
        expect(mockSetter).toHaveBeenCalledWith(3);
    });
});

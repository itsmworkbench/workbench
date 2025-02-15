import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {SimpleSelectableButton} from "./simple.selectable.button";
import '@testing-library/jest-dom';
import {TranslationProvider} from "@itsmworkbench/translation";
// Mock getter setter for testing
const mockSelectedOps = (initialValue: string = 'default'): [string, any] => {
    let value = initialValue;
    return [value, jest.fn() as any];
};

describe('SimpleSelectableButton', () => {
    it('renders with correct initial state and toggles on click', () => {
        const selectedOps = mockSelectedOps('selected-value');

        render(
            <TranslationProvider translationFn={k => {
                return k.toUpperCase(); }}>
                <SimpleSelectableButton
                    prefix="test-prefix"
                    selectedOps={selectedOps}
                    text="button-text"
                />
            </TranslationProvider>
        );

        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('TEST-PREFIX.BUTTON-TEXT');
        expect(button).toHaveStyle('border: 1px solid #000');

        fireEvent.click(button);
        expect(selectedOps[1]).toHaveBeenCalledWith('button-text');

        // Simulate re-render after selection
        render(
            <SimpleSelectableButton
                prefix="test-prefix"
                selectedOps={[selectedOps[1].mock.calls[0][0], selectedOps[1]]}
                text="button-text"
            />
        );
        waitFor(() => {
            expect(screen.getByRole('button')).toHaveStyle('border: 2px solid #007bff');
            expect(screen.getByRole('button')).toHaveStyle('background-color: #007bff');
        })
    });

    it('renders as selected if initial state matches text', () => {
        const selectedOps = mockSelectedOps('button-text');

        render(
            <SimpleSelectableButton
                prefix="test-prefix"
                selectedOps={selectedOps}
                text="button-text"
            />
        );

        const button = screen.getByRole('button');
        expect(button).toHaveStyle('border: 2px solid #007bff');
        expect(button).toHaveStyle('background-color: #007bff');
    });

    it(' changes if clicked when already selected', () => {
        const selectedOps = mockSelectedOps('button-text');

        render(
            <SimpleSelectableButton
                prefix="test-prefix"
                selectedOps={selectedOps}
                text="button-text"
            />
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(selectedOps[1]).toHaveBeenCalledTimes(1);
    });
});

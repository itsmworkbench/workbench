import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import {SimpleUnknownDisplay} from './simple.unknown.display';
import '@testing-library/jest-dom';
import {emptyPlugins, MockSovereignStateProvider} from "./sovereign.state.display.fixture";
// Mock translation and state

describe('SimpleUnknownDisplay Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    it('renders the unknown display message with selected sovereign', () => {
        render(<MockSovereignStateProvider url={'http://any/sovereign2'}><SimpleUnknownDisplay/></MockSovereignStateProvider>);

        expect(screen.getByText(/sovereign.unknown.display_translated/)).toBeInTheDocument();
        expect(screen.getByText('sovereign2')).toBeInTheDocument();
        expect(screen.getByText(/sovereign.unknown.display_translated/)).toHaveTextContent(`sovereign.unknown.display_translated: sovereign2`);
    });

    it('triggers setSelected on button click and updates sovereign', () => {
        const remember: string[] = [];
        render(<MockSovereignStateProvider url={'http://any/wrong'} remember={remember}><SimpleUnknownDisplay/></MockSovereignStateProvider>);

        const button = screen.getByRole('button', {name: /reload/i});
        fireEvent.click(button);
        expect(remember).toEqual(["http://any/sovereign1"]);

    });

    it('applies hover styling to the button', () => {
        render(<MockSovereignStateProvider url={'http://any/sovereign1'}><SimpleUnknownDisplay/></MockSovereignStateProvider>);

        const button = screen.getByRole('button', {name: /reload/i});

        // Initial style check
        expect(button).toHaveStyle('background-color: #0078d7');

        // Simulate hover
        fireEvent.mouseOver(button);
        expect(button).toHaveStyle('background-color: #005bb5');

        // Simulate mouse out
        fireEvent.mouseOut(button);
        expect(button).toHaveStyle('background-color: #0078d7');
    });

    it('does not crash if plugins list is empty', () => {
        const remember: string[] = [];
        render(<MockSovereignStateProvider url={'http://any/wrong'} remember={remember} plugins={emptyPlugins}><SimpleUnknownDisplay/></MockSovereignStateProvider>);

        const button = screen.getByRole('button', {name: /reload/i});
        fireEvent.click(button);

        expect(remember).toEqual(["http://any/sovereign1"])
    });
});
import React from 'react';
import { render, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MouseOver, SimpleMouseOver } from "./mouse.over";


describe('MouseOver', () => {
    it('wraps children correctly', () => {
        const { getByText } = render(
            <SimpleMouseOver>
                <div>Test Child</div>
            </SimpleMouseOver>
        );
        expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('changes color on mouse enter', () => {
        const changeFn = jest.fn();
        const { getByText } = render(
            <SimpleMouseOver linkHover="red" changeColour={changeFn}>
                <div style={{ color: 'blue' }}>Hover Me</div>
            </SimpleMouseOver>
        );

        const element = getByText('Hover Me');
        const parentElement = element.closest('div')!;

        fireEvent.mouseEnter(parentElement);

        expect(changeFn).toHaveBeenCalledWith('red');
    });

    it('restores original color on mouse leave', () => {
        const changeFn = jest.fn();
        const { getByText } = render(
            <SimpleMouseOver linkHover="red" changeColour={changeFn}>
                <div style={{ color: 'blue' }}>Hover Me</div>
            </SimpleMouseOver>
        );

        const element = getByText('Hover Me');
        const parentElement = element.closest('div')!;

        fireEvent.mouseEnter(parentElement);
        fireEvent.mouseLeave(parentElement);

        waitFor(() =>expect(changeFn).toHaveBeenCalledWith('blue'));
    });

    it('uses default blue hover color when not specified', () => {
        const changeFn = jest.fn();
        const { getByText } = render(
            <SimpleMouseOver changeColour={changeFn}>
                <div style={{ color: 'green' }}>Hover Me</div>
            </SimpleMouseOver>
        );

        const element = getByText('Hover Me');
        const parentElement = element.closest('div')!;

        fireEvent.mouseEnter(parentElement);

        expect(changeFn).toHaveBeenCalledWith('blue');
    });
});
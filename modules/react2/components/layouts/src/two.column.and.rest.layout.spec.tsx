// SimpleTwoColumnAndRestLayout.test.tsx
import React from 'react';
import {act, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {SimpleTwoColumnAndRestLayout} from "./two.column.and.rest.layout";


describe('SimpleTwoColumnAndRestLayout', () => {
    const originalInnerWidth = window.innerWidth;

    // Helper function to simulate window width changes.
    const setWindowWidth = (width: number) => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
        });
        window.dispatchEvent(new Event('resize'));
    };

    afterEach(() => {
        // Restore the original window.innerWidth wrapped in act.
        act(() => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: originalInnerWidth,
            });
            window.dispatchEvent(new Event('resize'));
        });
    });

    test('renders first, second, and rest children correctly', () => {
        const rootId = 'test-root';
        render(
            <SimpleTwoColumnAndRestLayout rootId={rootId}>
                <div data-testid="firstChild">First Child</div>
                <div data-testid="secondChild">Second Child</div>
                <div data-testid="restChild">Rest Child</div>
            </SimpleTwoColumnAndRestLayout>
        );

        const firstContainer = screen.getByTestId(`${rootId}.first`);
        expect(firstContainer).toHaveTextContent('First Child');

        const secondContainer = screen.getByTestId(`${rootId}.second`);
        expect(secondContainer).toHaveTextContent('Second Child');

        // Verify that the rest child is rendered.
        const restChild = screen.getByTestId('restChild');
        expect(restChild).toHaveTextContent('Rest Child');
    });

    test('does not render a rest container when no rest children are provided', () => {
        const rootId = 'test-root-no-rest';
        render(
            <SimpleTwoColumnAndRestLayout rootId={rootId}>
                <div>First Child</div>
                <div>Second Child</div>
            </SimpleTwoColumnAndRestLayout>
        );

        const topRow = screen.getByTestId(`${rootId}.topRow`);
        expect(topRow.childElementCount).toBe(2);

        // Ensure that a rest container is not rendered.
        expect(screen.queryByText(/Rest Child/)).toBeNull();
    });

    test('applies narrow layout (column direction) when window width is less than 600', () => {
        setWindowWidth(500); // Simulate a narrow window

        const rootId = 'narrow-root';
        render(
            <SimpleTwoColumnAndRestLayout rootId={rootId}>
                <div>First Child</div>
                <div>Second Child</div>
            </SimpleTwoColumnAndRestLayout>
        );

        const topRow = screen.getByTestId(`${rootId}.topRow`);
        expect(topRow).toHaveStyle('flex-direction: column');
    });

    test('applies wide layout (row direction) when window width is 600 or more', () => {
        setWindowWidth(800); // Simulate a wide window

        const rootId = 'wide-root';
        render(
            <SimpleTwoColumnAndRestLayout rootId={rootId}>
                <div>First Child</div>
                <div>Second Child</div>
            </SimpleTwoColumnAndRestLayout>
        );

        const topRow = screen.getByTestId(`${rootId}.topRow`);
        expect(topRow).toHaveStyle('flex-direction: row');
    });
});

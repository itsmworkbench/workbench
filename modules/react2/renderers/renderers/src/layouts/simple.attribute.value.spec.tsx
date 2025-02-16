import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimpleAttributeValueLayout } from './simple.attribute.value.layout';
import { AttributeValueOrientation } from '../attribute.value';

describe('SimpleAttributeValueLayout', () => {
    const renderComponent = (orientation?: AttributeValueOrientation) => {
        render(
            <SimpleAttributeValueLayout orientation={orientation} className="test-layout" data-testid="layout-container">
                <div data-testid="child-1">Child 1</div>
                <div data-testid="child-2">Child 2</div>
            </SimpleAttributeValueLayout>
        );
    };

    it('renders children in horizontal orientation by default', () => {
        renderComponent();

        const container = screen.getByTestId('layout-container');
        expect(container).toHaveStyle('flex-direction: row');
        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('renders children in horizontal orientation when explicitly set', () => {
        renderComponent('horizontal');

        const container = screen.getByTestId('layout-container');
        expect(container).toHaveStyle('flex-direction: row');
    });

    it('renders children in vertical orientation when set', () => {
        renderComponent('vertical');

        const container = screen.getByTestId('layout-container');
        expect(container).toHaveStyle('flex-direction: column');
    });

    it('applies the className prop', () => {
        renderComponent();

        const container = screen.getByTestId('layout-container');
        expect(container).toHaveClass('test-layout');
    });

    it('renders exactly two children', () => {
        renderComponent();

        const children = screen.getAllByTestId(/^child-/);
        expect(children).toHaveLength(2);
    });
});

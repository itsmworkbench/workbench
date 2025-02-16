import { render, screen } from "@testing-library/react";
import React, { ReactNode } from "react";
import { AttributeValueProvider, useAttributeValueComponents } from "./attribute.value";

import "@testing-library/jest-dom";
import { SimpleTextRenderer } from "./renderers/simple.text.renderer";
import { SimpleLabelRenderer } from "./renderers/simple.label.renderer";
import { TranslationFn, TranslationProvider } from "@itsmworkbench/translation";
import { renderWithProviders } from "./renderer.fixture";

const transationFn = (key: string) => key + "-translated";

function TestProvider({ children, tr = transationFn }: { children: ReactNode, tr?: TranslationFn }) {
    return <TranslationProvider translationFn={tr}>
        {children}
    </TranslationProvider>;
}

const renderers: any = {
    Label: SimpleLabelRenderer,
    Text: SimpleTextRenderer,
};

const TestComponent = () => {
    const { Text } = useAttributeValueComponents();
    return <Text rootId="root" attribute="Name" value="John Doe" />;
};
const TestComponentEmpty = () => {
    const { Text } = useAttributeValueComponents();
    return <Text rootId="root" attribute="Name" value="" />;
};
describe("AttributeValueProvider", () => {
    it("renders an attribute-value pair with translation and correct ID", () => {
        renderWithProviders(() => <TestProvider>
                <AttributeValueProvider
                    renderers={renderers}
                    AttributeValueLayout={({ children }) => <div>{children}</div>}
                    DataLayout={() => <div />}
                >
                    <TestComponent />
                </AttributeValueProvider>
            </TestProvider>,
        );

        const label = screen.getByText("Name-translated:");
        const value = screen.getByText("John Doe");

        expect(label).toBeInTheDocument();
        expect(value).toBeInTheDocument();
        expect(value).toHaveAttribute("id", "root-Name");
    });

    it("renders empty string for missing values", () => {
        renderWithProviders(() =>
            <TestProvider>
                <AttributeValueProvider
                    renderers={renderers}
                    AttributeValueLayout={({ children }) => <div>{children}</div>}
                    DataLayout={() => <div />}
                >
                    <TestComponentEmpty />
                </AttributeValueProvider>
            </TestProvider>,
        );

        const label = screen.getByText("Name-translated:");
        const value = screen.getByLabelText("Not available");  // Directly select by aria-label

        expect(label).toBeInTheDocument();
        expect(value).toBeEmptyDOMElement();  // Still checks DOM emptiness
    });


});

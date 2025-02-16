import { render, screen } from "@testing-library/react";
import React, { ReactNode } from "react";
import { SimpleTextRenderer } from "./simple.text.renderer";
import "@testing-library/jest-dom";
import { RawThemeProvider, themeForTests, ThemeProvider } from "@itsmworkbench/themes";
import { RenderProps } from "../renderers";

describe("SimpleTextRenderer", () => {
    const rootId = "root";
    const attribute = "name";

    interface TestProviderProps {
        children: ReactNode;
    }

    const TestProvider: React.FC<TestProviderProps> = ({ children }) => {
        return <RawThemeProvider theme={themeForTests }><>{children}</></RawThemeProvider>;
    };
    const Render: React.FC<RenderProps<string>> = props => {
        return <TestProvider>{<SimpleTextRenderer {...props} />}</TestProvider>;
    };
    it("renders the value when provided", () => {
        render(<Render rootId={rootId} attribute={attribute} value="John Doe" />);
        const span = screen.getByText("John Doe");

        expect(span).toBeInTheDocument();
        expect(span).toHaveAttribute("id", `${rootId}-${attribute}`);
        expect(span).not.toHaveAttribute("aria-label");
    });

    it("renders an empty span with an aria-label when value is missing", () => {
        render(<Render rootId={rootId} attribute="empty" value="" />);
        const span = screen.getByLabelText("Not available");

        expect(span).toBeInTheDocument();
        expect(span).toBeEmptyDOMElement();  // Empty visually
    });

    it("handles undefined gracefully with polite aria live", () => {
        render(<Render rootId={rootId} attribute="undefined" value={undefined} />);
        const span = screen.getByLabelText("Not available");

        expect(span).toBeInTheDocument();
        expect(span).toBeEmptyDOMElement();
        expect(span).toHaveAttribute("aria-live", "polite");
    });

    it("handles null gracefully with polite aria live", () => {
        render(<Render rootId={rootId} attribute="null" value={null as any} />);
        const span = screen.getByLabelText("Not available");

        expect(span).toBeInTheDocument();
        expect(span).toBeEmptyDOMElement();
        expect(span).toHaveAttribute("aria-live", "polite");
    });
    it("displays an empty string when value is undefined", () => {
        render(<Render rootId={rootId} attribute="undefined" value={undefined} />);
        const span = screen.getByTestId(`${rootId}-undefined`);

        // Assert that the span's text content is exactly an empty string
        expect(span).toHaveTextContent("");
    });
});

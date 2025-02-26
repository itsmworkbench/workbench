// SimplePanelWithWidth.test.tsx
import React from "react";
import { render, cleanup } from "@testing-library/react";
import {SimplePanelWithWidth} from "./panel.with.width";
import "@testing-library/jest-dom";

afterEach(cleanup);

describe("SimplePanelWithWidth", () => {
    it("renders correctly with no custom style", () => {
        const { container } = render(
            <SimplePanelWithWidth width={200}>
                Test Content
            </SimplePanelWithWidth>
        );
        const div = container.firstChild as HTMLElement;

        // Default style assertions
        expect(div).toHaveStyle("border: 1px solid black");
        expect(div).toHaveStyle("padding: 8px");
        expect(div).toHaveStyle("box-sizing: border-box");
        expect(div).toHaveStyle("width: 200px");
    });

    it("renders correctly with custom style", () => {
        const customStyle = { padding: "16px", backgroundColor: "red" };
        const { container } = render(
            <SimplePanelWithWidth width={300} style={customStyle}>
                Custom Content
            </SimplePanelWithWidth>
        );
        const div = container.firstChild as HTMLElement;

        // Default border and box-sizing should remain.
        expect(div).toHaveStyle("border: 1px solid black");
        expect(div).toHaveStyle("box-sizing: border-box");
        // Custom style should override the default padding.
        expect(div).toHaveStyle("padding: 16px");
        // Additional custom style.
        expect(div).toHaveStyle("background-color: red");
        // The width prop should be applied.
        expect(div).toHaveStyle("width: 300px");
    });

});

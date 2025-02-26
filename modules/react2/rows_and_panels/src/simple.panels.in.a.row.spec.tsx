// SimplePanelsInARow.test.tsx
import React from "react";
import { render, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import {PanelWithWidthProps} from "./panel.with.width";
import {SimplePanelsInARow} from "./panels.in.a.row";

// A dummy panel component for testing purposes.
const DummyPanel: React.FC<PanelWithWidthProps> = ({ children, width }) => (
    <div data-testid="dummy-panel" style={{ width: `${width}px` }}>
        {children}
    </div>
);

afterEach(cleanup);

describe("SimplePanelsInARow", () => {
    it("renders correctly with default style (no custom style provided)", () => {
        const { container, getAllByTestId } = render(
            <SimplePanelsInARow width={200} panel={DummyPanel}>
                <span>Panel 1</span>
                <span>Panel 2</span>
            </SimplePanelsInARow>
        );
        const containerDiv = container.firstChild as HTMLElement;

        // Check that the container has the default row style.
        expect(containerDiv).toHaveStyle("display: flex");
        expect(containerDiv).toHaveStyle("flex-wrap: wrap");
        expect(containerDiv).toHaveStyle("align-items: stretch");
        expect(containerDiv).toHaveStyle("box-sizing: border-box");

        // Verify that the correct number of panels were rendered with the proper width.
        const panels = getAllByTestId("dummy-panel");
        expect(panels.length).toBe(2);
        panels.forEach(panel => {
            expect(panel).toHaveStyle("width: 200px");
        });
    });

    it("renders correctly with custom style", () => {
        const customStyle = {
            backgroundColor: "red",
            alignItems: "center", // Override the default alignItems value
        };
        const { container, getAllByTestId } = render(
            <SimplePanelsInARow width={300} panel={DummyPanel} style={customStyle}>
                <span>Panel 1</span>
                <span>Panel 2</span>
            </SimplePanelsInARow>
        );
        const containerDiv = container.firstChild as HTMLElement;

        // Verify the container has the merged styles: default styles merged with custom overrides.
        expect(containerDiv).toHaveStyle("display: flex");
        expect(containerDiv).toHaveStyle("flex-wrap: wrap");
        expect(containerDiv).toHaveStyle("box-sizing: border-box");
        // alignItems should reflect the custom style override.
        expect(containerDiv).toHaveStyle("align-items: center");
        // Custom background should be applied.
        expect(containerDiv).toHaveStyle("background-color: red");

        // Verify that the dummy panels are rendered with the specified width.
        const panels = getAllByTestId("dummy-panel");
        expect(panels.length).toBe(2);
        panels.forEach(panel => {
            expect(panel).toHaveStyle("width: 300px");
        });
    });
});

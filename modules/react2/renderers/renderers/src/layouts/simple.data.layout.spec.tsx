import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";
import { SimpleDataLayout } from "./simple.data.layout";
import { renderWithProviders } from "../renderer.fixture";
import { SimpleDateRenderer } from "../renderers/simple.date.renderer";

describe("SimpleDataLayout", () => {
    it("renders rows and cells with appropriate roles", () => {
        renderWithProviders(() => <SimpleDataLayout rootId="someRootId" layout={[2, 1]}>
            <div>Item 1</div>
            <div>Item 2</div>
            <div>Item 3</div>
        </SimpleDataLayout>);


        const main = screen.getByTestId("someRootId-data-layout");
        expect(main).toBeInTheDocument();

        const rows = screen.getAllByRole("row");
        expect(rows).toHaveLength(2);


        const cells = screen.getAllByRole("cell");
        expect(cells).toHaveLength(3);
    });

    it("handles layouts larger than the number of children", () => {
        renderWithProviders(() => <SimpleDataLayout rootId="someRootId" layout={[3, 2]}>
            <div>Item 1</div>
        </SimpleDataLayout>);

        const rows = screen.getAllByRole("row");
        expect(rows).toHaveLength(1);

        const cells = screen.getAllByRole("cell");
        expect(cells).toHaveLength(1);
    });

    it("renders with custom class names", () => {
        renderWithProviders(() => <SimpleDataLayout rootId="someRootId" layout={[1]} className="custom-class">
                <div>Child</div>
            </SimpleDataLayout>,
        );

        const container = screen.getByRole("presentation");
        expect(container).toHaveClass("custom-class");
    });


});

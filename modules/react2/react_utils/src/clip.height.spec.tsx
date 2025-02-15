import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { ClipHeight } from "./clip.height";

//Note: I don't know how to check it actually clipped!
describe("ClipHeight component", () => {
    const longText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20);

    test("applies maxHeight and hides overflow by default", () => {
        render(
            <ClipHeight maxHeight="100px">
                <p>{longText}</p>
            </ClipHeight>
        );

        const container = screen.getByText(/Lorem ipsum/).parentElement;

        // Verify styles applied correctly
        expect(container).toHaveStyle({
            maxHeight: "100px",
            overflowY: "hidden"
        });

        // Content is in the DOM (even if clipped)
        expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument();
    });

    test("enables scrollbar when scrollable is true", () => {
        render(
            <ClipHeight maxHeight="100px" scrollable>
                <p>{longText}</p>
            </ClipHeight>
        );

        const container = screen.getByText(/Lorem ipsum/).parentElement;

        // Verify styles applied correctly
        expect(container).toHaveStyle({
            maxHeight: "100px",
            overflowY: "auto"
        });

        // Content is in the DOM
        expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument();
    });

    test("forces height when force is true", () => {
        render(
            <ClipHeight maxHeight="200px" force>
                <p>Forced Content</p>
            </ClipHeight>
        );

        const container = screen.getByText("Forced Content").parentElement;

        expect(container).toHaveStyle({
            height: "200px",
            maxHeight: "200px",
            overflowY: "hidden"
        });

    });


    test("applies small maxHeight, clipping larger content", () => {
        render(
            <ClipHeight maxHeight="50px">
                <p>{longText}</p>
            </ClipHeight>
        );

        const container = screen.getByText(/Lorem ipsum/).parentElement;

        // Assert CSS styling reflects clipping
        expect(container).toHaveStyle({
            maxHeight: "50px",
            overflowY: "hidden"
        });

        // Confirm that the text still exists in the DOM
        expect(screen.getByText(/Lorem ipsum/)).toBeInTheDocument();
    });
});

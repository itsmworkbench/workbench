import {cleanForRender, CleanHeaders} from "./clean.headers";
import React from "react";
import {render, screen} from '@testing-library/react';
import "@testing-library/jest-dom";

describe("cleanForRender", () => {
    it("trims leading and trailing spaces", () => {
        expect(cleanForRender("   Test String   ")).toBe("Test String");
    });

    it("removes excessive line breaks (more than 2)", () => {
        const input = "Line 1\n\n\n\nLine 2";
        expect(cleanForRender(input)).toBe("Line 1\n\nLine 2");
    });

    it("preserves single and double line breaks", () => {
        const input = "Line 1\n\nLine 2";
        expect(cleanForRender(input)).toBe("Line 1\n\nLine 2");
    });

    it("handles empty strings", () => {
        expect(cleanForRender("")).toBe("");
    });

    it("handles strings without line breaks or spaces", () => {
        expect(cleanForRender("PlainText")).toBe("PlainText");
    });
});

describe("CleanHeaders", () => {
    it("renders children inside a div with 'clean-headers' class", () => {
        render(
            <CleanHeaders>
                <h1>Title</h1>
            </CleanHeaders>
        );

        const container = screen.getByText("Title").closest("div");
        expect(container).toHaveClass("clean-headers");
    });


    it("applies the correct CSS styles via a <style> tag", () => {
        render(
            <CleanHeaders>
                <h1>Header One</h1>
                <h2>Header Two</h2>
                <h3>Header Three</h3>
                <h4>Header Four</h4>
            </CleanHeaders>
        );

        const styleElement = document.querySelector("style");
        expect(styleElement).toBeInTheDocument();
        expect(styleElement).toHaveTextContent(".clean-headers h1");
        expect(styleElement).toHaveTextContent("font-weight: 700");
        expect(styleElement).toHaveTextContent(".clean-headers h2");
        expect(styleElement).toHaveTextContent("font-style: italic");
    });

    it("renders multiple heading elements correctly", () => {
        render(
            <CleanHeaders>
                <h1>Header 1</h1>
                <h2>Header 2</h2>
                <h3>Header 3</h3>
                <h4>Header 4</h4>
            </CleanHeaders>
        );

        expect(screen.getByText("Header 1")).toBeInTheDocument();
        expect(screen.getByText("Header 2")).toBeInTheDocument();
        expect(screen.getByText("Header 3")).toBeInTheDocument();
        expect(screen.getByText("Header 4")).toBeInTheDocument();
    });
});

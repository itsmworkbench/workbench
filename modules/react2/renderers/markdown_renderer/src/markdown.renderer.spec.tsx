import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MarkdownRenderer } from "./markdown.renderer";


describe("MarkdownRenderer", () => {
    it("renders markdown content inside CleanHeaders", () => {
        render(<MarkdownRenderer rootId={"root"} attribute={"test"} value="**Bold Text**" />);

        // Assert that the cleaned markdown is rendered
        const boldText = screen.getByText("Bold Text");
        expect(boldText).toBeInTheDocument();
        expect(boldText?.tagName).toEqual("STRONG");
        const cleanHeaders = boldText.closest(".clean-headers");
        expect(cleanHeaders).toBeInTheDocument();
    });

    it("renders with the correct ID based on rootId and attribute", () => {
        render(<MarkdownRenderer rootId={"root"} attribute={"test"} value="Some Text" />);

        const container = screen.getByTestId(`root-test`);
        expect(container).toBeInTheDocument();
    });
});

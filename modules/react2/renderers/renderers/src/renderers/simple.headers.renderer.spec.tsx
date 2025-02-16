import { render, screen } from "@testing-library/react";
import React from "react";
import '@testing-library/jest-dom';
import { SimpleH1Renderer, SimpleH2Renderer, SimpleH3Renderer } from "./simple.headers.renderer";

describe("Simple Heading Renderers", () => {

    it("renders an h1 element with the correct text and ID", () => {
        render(<SimpleH1Renderer attribute="title" rootId="root" value="Main Title" />);
        const heading = screen.getByRole("heading", { level: 1 });

        expect(heading).toHaveTextContent("Main Title");
        expect(heading).toHaveAttribute("id", "root-title");
    });

    it("renders an h2 element with the correct text and ID", () => {
        render(<SimpleH2Renderer attribute="subtitle" rootId="root" value="Subsection Title" />);
        const heading = screen.getByRole("heading", { level: 2 });

        expect(heading).toHaveTextContent("Subsection Title");
        expect(heading).toHaveAttribute("id", "root-subtitle");
    });

    it("renders an h3 element with the correct text and ID", () => {
        render(<SimpleH3Renderer attribute="detail" rootId="root" value="Detail Title" />);
        const heading = screen.getByRole("heading", { level: 3 });

        expect(heading).toHaveTextContent("Detail Title");
        expect(heading).toHaveAttribute("id", "root-detail");
    });

    it("ensures headings are correctly hierarchical", () => {
        render(
            <>
                <SimpleH1Renderer attribute="main" rootId="root" value="Main Section" />
                <SimpleH2Renderer attribute="sub" rootId="root" value="Sub Section" />
                <SimpleH3Renderer attribute="detail" rootId="root" value="Detail Section" />
            </>
        );

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Main Section");
        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Sub Section");
        expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Detail Section");
    });

    it("renders empty headings if value is an empty string", () => {
        render(<SimpleH1Renderer attribute="empty" rootId="root" value="" />);
        const heading = screen.getByRole("heading", { level: 1 });

        expect(heading).toBeEmptyDOMElement();
    });

    it("renders empty headings if value is undefined", () => {
        render(<SimpleH1Renderer attribute="empty" rootId="root" value={undefined} />);
        const heading = screen.getByRole("heading", { level: 1 });

        expect(heading).toBeEmptyDOMElement();
    });

    it("renders empty headings if value is null (coercion to any)", () => {
        render(<SimpleH1Renderer attribute="empty" rootId="root" value={null as any} />);
        const heading = screen.getByRole("heading", { level: 1 });

        expect(heading).toBeEmptyDOMElement();
    });
});

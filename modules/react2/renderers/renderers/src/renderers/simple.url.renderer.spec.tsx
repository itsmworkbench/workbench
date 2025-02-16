// simple.url.renderer.test.tsx

import React from "react";
import { screen } from "@testing-library/react";
import { SimpleUrlRenderer } from "./simple.url.renderer";

import "@testing-library/jest-dom";
import { ellipsesInMiddle } from "@itsmworkbench/utils";
import { renderWithProviders } from "../renderer.fixture";

// Import your providers

describe("SimpleUrlRenderer", () => {
    const rootId = "root";
    const attribute = "test";

    // Define mock themes
    const themes = {
        default: {
            name: "eon theme",
            header: {
                meAtEonLogoUrl: "someMeAtEonLogoUrl",
            },
            renderer: {
                h1WithUrl: {
                    color: "#262626",
                },
            },
        },
        dark: {
            name: "dark theme",
            header: {
                meAtEonLogoUrl: "someMeAtEonLogoUrl",
            },
            renderer: {
                h1WithUrl: {
                    color: "#ffffff",
                },
            },
        },
        light: {
            name: "light theme",
            header: {
                meAtEonLogoUrl: "someMeAtEonLogoUrl",
            },
            renderer: {
                h1WithUrl: {
                    color: "#000000",
                },
            },
        },
    };

    // Define mock logError function
    const mockLogError = jest.fn();

    // Define a helper function to render the component with providers


    afterEach(() => {
        jest.clearAllMocks();
    });


    it("renders a valid URL as a link", () => {
        renderWithProviders(() => <SimpleUrlRenderer rootId={rootId} attribute={attribute} value="https://example.com" />);
        const link = screen.getByRole("link");

        expect(link).toHaveAttribute("href", "https://example.com");
        expect(link).toHaveTextContent("https://example.com");
        expect(link).toHaveAttribute("target", "_blank");
    });

    it("truncates long URLs with ellipses in the middle", () => {
        const longUrl = "https://averylongexample.com/some/deep/path/resource/file.html";
        const expectedText = ellipsesInMiddle(longUrl, 70);
        renderWithProviders(() => <SimpleUrlRenderer rootId={rootId} attribute="long-url" value={longUrl} />);

        const link = screen.getByRole("link");

        expect(link).toHaveTextContent(expectedText);
    });

    it("falls back to # for invalid URLs", () => {
        renderWithProviders(() => <SimpleUrlRenderer rootId={rootId} attribute="invalid-url" value="invalid-url" />);
        const link = screen.getByRole("link");

        expect(link).toHaveAttribute("href", "#");
        expect(link).toHaveTextContent("invalid-url");
    });

    it("renders empty string as invalid URL", () => {
        renderWithProviders(() => <SimpleUrlRenderer rootId={rootId} attribute="empty-url" value="" />);
        const link = screen.getByRole("link");

        expect(link).toHaveAttribute("href", "#");
        expect(link).toBeEmptyDOMElement();
    });

    it("renders undefined value gracefully", () => {
        renderWithProviders(() => <SimpleUrlRenderer rootId={rootId} attribute="undefined-url" value={undefined} />);
        const link = screen.getByRole("link");

        expect(link).toHaveAttribute("href", "#");
        expect(link).toBeEmptyDOMElement();
    });

    it("provides full URL in aria-label and title", () => {
        const testUrl = "https://example.com/path";
        renderWithProviders(() => <SimpleUrlRenderer rootId={rootId} attribute="test" value={testUrl} />);
        const link = screen.getByRole("link");

        expect(link).toHaveAttribute("aria-label", testUrl);
        expect(link).toHaveAttribute("title", testUrl);
    });

    it("provides 'Not available' in aria-label and title if value is undefined", () => {
        renderWithProviders(() => <SimpleUrlRenderer rootId={rootId} attribute="test" value={undefined} />);
        const link = screen.getByRole("link");

        expect(link).toHaveAttribute("aria-label", "Not available");
        expect(link).toHaveAttribute("title", "Not available");
    });
});

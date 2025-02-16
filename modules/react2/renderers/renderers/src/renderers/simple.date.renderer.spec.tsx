import { render, screen } from "@testing-library/react";
import React from "react";

import '@testing-library/jest-dom';
import { SimpleDateRenderer } from "./simple.date.renderer";
import { renderWithProviders } from "../renderer.fixture";

describe("SimpleDateRenderer (locale-independent tests)", () => {
    // Mock Date.prototype.toLocaleString globally
    beforeAll(() => {
        jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation((locale, options) => {
            if (options?.month === 'short') return 'May';
            return 'Unknown';
        });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("renders date in dd/MMM/yyyy format consistently", () => {
        renderWithProviders(() =><SimpleDateRenderer attribute="test" rootId="root" value="2024-05-01" />);
        expect(screen.getByText("01/May/2024")).toBeInTheDocument();
    });

    it("returns 'Invalid date' for invalid date strings", () => {
       renderWithProviders(() =><SimpleDateRenderer attribute="test" rootId="root" value="invalid-date" />);
        expect(screen.getByText("Invalid date")).toBeInTheDocument();
    });

    it("returns 'Invalid date' for empty string values", () => {
       renderWithProviders(() =><SimpleDateRenderer attribute="test" rootId="root" value="" />);
        expect(screen.getByText("Invalid date")).toBeInTheDocument();
    });

    it("returns 'Invalid date' for undefined value", () => {
       renderWithProviders(() =><SimpleDateRenderer attribute="test" rootId="root" value={undefined} />);
        expect(screen.getByText("Invalid date")).toBeInTheDocument();
    });

    it("renders aria-label and title for accessibility", () => {
       renderWithProviders(() =><SimpleDateRenderer attribute="test" rootId="root" value="2024-12-25" />);
        const timeElement = screen.getByText("25/May/2024");
        expect(timeElement).toHaveAttribute("aria-label", "Formatted date: 25/May/2024");
        expect(timeElement).toHaveAttribute("title", "25/May/2024");
    });

    it("handles null value and returns 'Invalid date'", () => {
       renderWithProviders(() =><SimpleDateRenderer attribute="test" rootId="root" value={null as any} />);
        expect(screen.getByText("Invalid date")).toBeInTheDocument();
    });
});

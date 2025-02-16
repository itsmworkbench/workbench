import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimpleLabelRenderer } from './simple.label.renderer';
import { renderWithProviders } from "../renderer.fixture";

describe('SimpleLabelRenderer', () => {
    it('renders the label with the correct text and ID', () => {
       renderWithProviders(() =><SimpleLabelRenderer rootId="root" attribute="username" value="User Name" />);
        const label = screen.getByText("User Name:");

        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute("for", "root-username");
    });

    it('renders an empty label if value is an empty string', () => {
       renderWithProviders(() =><SimpleLabelRenderer rootId="root" attribute="username" value="" />);
        const label = screen.getByText(":");

        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute("for", "root-username");
    });

    it('renders an empty label if value is undefined', () => {
       renderWithProviders(() =><SimpleLabelRenderer rootId="root" attribute="username" value={undefined} />);
        const label = screen.getByText(":");

        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute("for", "root-username");
    });

    it('renders correctly with special characters in value', () => {
       renderWithProviders(() =><SimpleLabelRenderer rootId="root" attribute="username" value="Name & Email" />);
        const label = screen.getByText("Name & Email:");

        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute("for", "root-username");
    });

    it('renders correctly for multi-word attribute names', () => {
       renderWithProviders(() =><SimpleLabelRenderer rootId="root" attribute="user-name" value="User Name" />);
        const label = screen.getByText("User Name:");

        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute("for", "root-user-name");
    });

    it('renders null as an empty string', () => {
       renderWithProviders(() =><SimpleLabelRenderer rootId="root" attribute="username" value={null as any} />);
        const label = screen.getByText(":");

        expect(label).toBeInTheDocument();
        expect(label).toHaveAttribute("for", "root-username");
    });
});

import React from 'react';
import {render, screen} from '@testing-library/react';
import {MockSovereignStateProvider} from "./sovereign.state.display.fixture";
import {DisplaySelectedSovereignPage} from "./sovereign.state.display";
import '@testing-library/jest-dom';

// Utility to render with providers
const renderWithProviders = (ui: React.ReactNode, url: string = '/sovereign1', plugins = undefined) => {
    return render(
        <MockSovereignStateProvider url={url} plugins={plugins}>
            {ui}
        </MockSovereignStateProvider>
    );
};

describe('DisplaySelectedSovereignPage', () => {
    it('renders the selected sovereign plugin sovereign1', () => {
        render(<MockSovereignStateProvider url='http://any/sovereign1'><DisplaySelectedSovereignPage/></MockSovereignStateProvider>);

        // Assert that sovereign1 is displayed
        const sovereignDisplay = screen.getByText(/sovereign1/i);
        expect(sovereignDisplay).toBeInTheDocument();
    });
    it('renders the selected sovereign plugin sovereign2', () => {
        render(<MockSovereignStateProvider url='http://any/sovereign2'><DisplaySelectedSovereignPage/></MockSovereignStateProvider>);

        // Assert that sovereign1 is displayed
        const sovereignDisplay = screen.getByText(/sovereign2/i);
        expect(sovereignDisplay).toBeInTheDocument();
    });

    it('falls back to the first plugin if no sovereign is selected', () => {
        render(<MockSovereignStateProvider url='http://any'><DisplaySelectedSovereignPage/></MockSovereignStateProvider>);

        // Assert that the first available plugin (sovereign1) is rendered
        const fallbackDisplay = screen.getByText(/sovereign1/i);
        expect(fallbackDisplay).toBeInTheDocument();
    });

    it('renders UnknownDisplay if no plugins are available', () => {
        render(<MockSovereignStateProvider url='http://any/youwhat'><DisplaySelectedSovereignPage/></MockSovereignStateProvider>);
        expect(screen.getByText(/sovereign.unknown.display_translated/)).toBeInTheDocument();
        expect(screen.getByText('youwhat')).toBeInTheDocument();

    });
});

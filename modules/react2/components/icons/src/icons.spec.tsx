import React from 'react';
import {render, screen} from '@testing-library/react';

import {TranslationContext, TranslationFn} from "@itsmworkbench/translation";
import '@testing-library/jest-dom';
import {IconProvider, simpleIconContext, useIcon} from "./icons";
// Mock translation function
const mockTranslation: TranslationFn = (key: string) => `${key}_translated`;

// Mock component to test icon rendering
const TestComponent = ({iconName, purpose, type}: { iconName: string, purpose?: string, type: 'decorative' | 'meaningful' }) => {
    const {DecorativeIcon, MeaningfulIcon} = useIcon();
    const Icon = type === 'decorative' ? DecorativeIcon(iconName) : MeaningfulIcon(iconName, purpose || '');
    return <Icon/>;
};

describe('Icon Context', () => {

    it('renders a decorative icon with role="presentation"', () => {
        render(
            <IconProvider icons={simpleIconContext}>
                <TestComponent type='decorative' iconName="settings"/>
            </IconProvider>
        );

        const img = screen.getByRole('presentation');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'icons/settings.svg');
        expect(img).toHaveAttribute('alt', '');
    });

    it('renders a meaningful icon with translated alt text', () => {
        render(
            <TranslationContext.Provider value={mockTranslation}>
                <IconProvider icons={simpleIconContext}>
                    <TestComponent iconName="delete" type="meaningful" purpose="delete_user"/>
                </IconProvider>
            </TranslationContext.Provider>
        );

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'icons/delete.svg');
        expect(img).toHaveAttribute('alt', 'delete_user_translated');
    });

});

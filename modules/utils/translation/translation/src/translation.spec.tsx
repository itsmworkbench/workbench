import React from 'react';
import {render, screen} from '@testing-library/react';
import {TranslationProvider, useTranslation} from './translation';
import "@testing-library/jest-dom";

describe('Translation Context', () => {
    it('uses the default translation function when no provider is specified', () => {
        const TestComponent = () => {
            const translate = useTranslation();
            return <div>{translate('thisIsATest')}</div>;
        };

        render(<TestComponent/>);
        expect(screen.getByText('This Is A Test')).toBeInTheDocument();
    });

    it('uses a custom translation function from the provider', () => {
        const customTranslationFn = (key: string) => `Translated: ${key}`;

        const TestComponent = () => {
            const translate = useTranslation();
            return <div>{translate('customKey')}</div>;
        };

        render(
            <TranslationProvider translationFn={customTranslationFn}>
                <TestComponent/>
            </TranslationProvider>
        );

        expect(screen.getByText('Translated: customKey')).toBeInTheDocument();
    });

    it('falls back to the default function if no custom provider is present', () => {
        const TestComponent = () => {
            const translate = useTranslation();
            return <div>{translate('anotherTestKey')}</div>;
        };

        render(<TestComponent/>);
        expect(screen.getByText('Another Test Key')).toBeInTheDocument();
    });

});

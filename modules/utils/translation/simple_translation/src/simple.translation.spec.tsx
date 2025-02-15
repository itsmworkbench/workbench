import React from 'react';
import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import {SimpleTranslationProvider, makeTranslationFn} from './simple.translation';
import {TranslationContext, TranslationFn} from '@itsmworkbench/translation';

// Mock Translation Data
const mockTranslationData = {
    greeting: {
        hello: 'Hello',
    },
    farewell: {
        goodbye: 'Goodbye'
    }
};

// Component to Test Translation
const MockComponent = ({translationKey}: { translationKey: string }) => {
    const translate = React.useContext(TranslationContext) as TranslationFn;
    return <span>{translate(translationKey)}</span>;
};

// Test Cases
describe('SimpleTranslationProvider', () => {
    it('provides translation function to children', () => {
        render(
            <SimpleTranslationProvider translation={mockTranslationData}>
                <MockComponent translationKey="greeting.hello"/>
            </SimpleTranslationProvider>
        );

        // Assert that the translation works correctly
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('returns key with "not found" if translation is missing', () => {
        render(
            <SimpleTranslationProvider translation={mockTranslationData}>
                <MockComponent translationKey="missing.key"/>
            </SimpleTranslationProvider>
        );

        // Assert that missing keys return a fallback value
        expect(screen.getByText('missing.key.not.found')).toBeInTheDocument();
    });
});

describe('makeTranslationFn', () => {
    const translationFn = makeTranslationFn(mockTranslationData);

    it('returns correct translation for existing key', () => {
        expect(translationFn('greeting.hello')).toBe('Hello');
    });

    it('returns undefined if translation is missing', () => {
        expect(translationFn('random.key')).toBeUndefined()
    });
});

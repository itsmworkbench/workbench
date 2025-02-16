import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SimpleJsonRenderer } from './simple.json.renderer';

describe('SimpleJsonRenderer', () => {
    it('renders valid JSON object directly', () => {
        const jsonObject = { key: "value", nested: { count: 5 } };
        render(<SimpleJsonRenderer rootId="root" attribute="json" value={jsonObject} />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent('{ "key": "value", "nested": { "count": 5 } }');
    });

    it('renders JSON from string', () => {
        const jsonString = '{"key":"value"}';
        render(<SimpleJsonRenderer rootId="root" attribute="json" value={jsonString} />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent(JSON.stringify(jsonString, null, 2));
    });

    it('renders number values as JSON', () => {
        render(<SimpleJsonRenderer rootId="root" attribute="json" value={42} />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent('42');
    });

    it('renders string values as JSON', () => {
        render(<SimpleJsonRenderer rootId="root" attribute="json" value="Hello" />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent('"Hello"');  // Strings are quoted in JSON
    });

    it('renders undefined as "null"', () => {
        render(<SimpleJsonRenderer rootId="root" attribute="json" value={undefined} />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent('null');
    });

    it('renders null as "null"', () => {
        render(<SimpleJsonRenderer rootId="root" attribute="json" value={null} />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent('null');
    });

    it('renders empty object as "{}"', () => {
        render(<SimpleJsonRenderer rootId="root" attribute="json" value={{}} />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent('{}');
    });

    it('renders arrays correctly', () => {
        render(<SimpleJsonRenderer rootId="root" attribute="json" value={[1, 2, 3]} />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent('[ 1, 2, 3 ]');
    });

    it('renders nested objects', () => {
        const nestedObject = { outer: { inner: { value: 10 } } };
        render(<SimpleJsonRenderer rootId="root" attribute="json" value={nestedObject} />);

        const pre = screen.getByRole('code');
        expect(pre).toHaveTextContent('{ "outer": { "inner": { "value": 10 } } }');
    });
});

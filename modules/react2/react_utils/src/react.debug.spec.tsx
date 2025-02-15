import { renderHook } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React, { PropsWithChildren } from 'react';
import { DebugStateProvider, useDebug } from './react.debug';

// Mock console functions
const consoleLogMock = jest.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('useDebug Hook', () => {
    const mockState: { [key: string]: boolean } = {};

    // Fixed Wrapper with PropsWithChildren
    const Wrapper: React.FC<PropsWithChildren<{ state: typeof mockState }>> = ({ state, children }) => (
        <DebugStateProvider debugState={state}>{children}</DebugStateProvider>
    );

    afterEach(() => {
        consoleLogMock.mockClear();
        consoleErrorMock.mockClear();
    });

    afterAll(() => {
        consoleLogMock.mockRestore();
        consoleErrorMock.mockRestore();
    });

    test('logs messages when debug is true', () => {
        const { result } = renderHook(() => useDebug('TestComponent'), {
            wrapper: (props) => <Wrapper state={{ TestComponent: true }} {...props} />
        });

        act(() => {
            result.current('This should log');
        });

        expect(consoleLogMock).toHaveBeenCalledWith('TestComponent', 'This should log');
        expect(result.current.debug).toBe(true);
    });


    test('does not log when debug is false', () => {
        const { result } = renderHook(() => useDebug('TestComponent'), {
            wrapper: (props) => <Wrapper state={{ TestComponent: false }} {...props} />
        });

        act(() => {
            result.current('This should NOT log');
        });

        expect(consoleLogMock).not.toHaveBeenCalled();
        expect(result.current.debug).toBe(false);
    });

    test('logs errors with correct formatting', () => {
        const { result } = renderHook(() => useDebug('ErrorComponent'), {
            wrapper: (props) => <Wrapper state={{ ErrorComponent: true }} {...props} />
        });

        const error = new Error('Test error');
        act(() => {
            result.current.debugError(error, 'Additional info');
        });

        expect(consoleErrorMock).toHaveBeenCalledWith(
            '[ERROR] ErrorComponent',
            error,
            'Additional info'
        );
    });

    test('does not log errors when debug is false', () => {
        const { result } = renderHook(() => useDebug('ErrorComponent'), {
            wrapper: (props) => <Wrapper state={{ ErrorComponent: false }} {...props} />
        });

        const error = new Error('Silent error');
        act(() => {
            result.current.debugError(error, 'Should not log');
        });

        expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    test('returns a function with attached properties', () => {
        const { result } = renderHook(() => useDebug('PropertyComponent'), {
            wrapper: (props) => <Wrapper state={{ PropertyComponent: true }} {...props} />
        });

        expect(typeof result.current).toBe('function');
        expect(result.current.debug).toBe(true);
        expect(typeof result.current.debugError).toBe('function');
    });

    test('reacts to debug state changes - i.e. is memoised', () => {
        const state = { TestComponent: false };
        const { result, rerender } = renderHook(() => useDebug('TestComponent'), {
            wrapper: (props) => <Wrapper state={state} {...props} />
        });

        act(() => {
            result.current('Should not log initially');
        });
        expect(consoleLogMock).not.toHaveBeenCalled();

        // Update the state and rerender
        state.TestComponent = true;
        rerender();

        act(() => {
            result.current('This should log now');
        });
        expect(consoleLogMock).toHaveBeenCalledWith('TestComponent', 'This should log now');
    });

});

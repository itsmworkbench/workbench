import React, {ReactNode} from 'react';
import {act, render, renderHook, screen} from '@testing-library/react';

import {WindowUrlContext} from './path.name.provider';
import '@testing-library/jest-dom';
import {makeRoutingSegmentContextFor} from "./routing";
import {DebugStateProvider} from "../react.debug";
import {renderHookShouldThrowError} from "../render.hook.utils";

// Mock URL data for testing
const mockUrlData = {
    url: new URL('http://localhost/segment1/segment2'),
    parts: ['segment1', 'segment2'],
};

// Helper component to wrap the provider
const createWrapper = (Provider: ({children}: { children: ReactNode }) => React.ReactElement, children: React.ReactNode) => (
    <DebugStateProvider debugState={{}}>
        <WindowUrlContext.Provider value={[mockUrlData, jest.fn()]}>
            <Provider>
                {children}
            </Provider>
        </WindowUrlContext.Provider>
    </DebugStateProvider>
);

// Mock routing segment for testing
const routingContext = makeRoutingSegmentContextFor('testSegment', 1);  // Testing segment at index 1

describe('makeRoutingSegmentContextFor', () => {
    it('provides the correct segment value to children', () => {
        render(
            createWrapper(routingContext.Provider,
                <routingContext.context.Consumer>
                    {(value) => <div>{value[0]}</div>}
                </routingContext.context.Consumer>
            )
        );

        expect(screen.getByText('segment2')).toBeInTheDocument();
    });

    it('throws an error when hook is used outside the provider', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DebugStateProvider debugState={{}}>
                {children}
            </DebugStateProvider>
        );

        renderHookShouldThrowError(
            () => routingContext.use(),
            's/w: useTestSegment must be used within a TestSegmentProvider',
            { wrapper }
        );
    });

    it('updates the URL path and state correctly', () => {
        const mockSetUrlData = jest.fn();

        const wrapper = ({children}: { children: React.ReactNode }) => (
            <DebugStateProvider debugState={{}}>
                <WindowUrlContext.Provider value={[mockUrlData, mockSetUrlData]}>
                    <routingContext.Provider>{children}</routingContext.Provider>
                </WindowUrlContext.Provider>
            </DebugStateProvider>
        );

        const {result} = renderHook(() => routingContext.use(), {wrapper});

        // Update the segment value
        act(() => {
            result.current[1]('new-segment');
        });

        // Verify URL and state update
        expect(mockSetUrlData).toHaveBeenCalledWith({
            ...mockUrlData,
            parts: ['segment1', 'new-segment'],
            url: new URL('http://localhost/segment1/new-segment'),
        });
    });
});

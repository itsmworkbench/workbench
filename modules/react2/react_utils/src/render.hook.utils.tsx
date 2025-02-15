/**
 * Utility to render a hook and assert that it throws an error.
 * Suppresses console.error during the render to avoid polluting test output.
 */
import {renderHook, RenderHookOptions} from '@testing-library/react';

export const renderHookShouldThrowError = (
    hook: () => any,
    errorMessage?: string,
    options?: RenderHookOptions<unknown>
) => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
        let caughtError: Error | null = null;
        try {
            renderHook(hook, options);  // Pass options (like wrapper) to renderHook
        } catch (error) {
            caughtError = error as Error;
        }
        if (!caughtError) throw new Error('Expected hook to throw an error');
        expect(caughtError).toBeInstanceOf(Error);
        if (errorMessage) expect(caughtError.message).toEqual(errorMessage);
        return caughtError;
    } finally {
        consoleErrorSpy.mockRestore();
    }
};


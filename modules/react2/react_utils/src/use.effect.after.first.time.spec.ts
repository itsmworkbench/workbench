import {renderHook, act, waitFor} from "@testing-library/react";
import {useEffectAfterFirstTime} from "./use.effect.after.first.time";
import {renderHookShouldThrowError} from "./render.hook.utils";


describe("useEffectAfterFirstTime", () => {
    test("skips effect on initial render", () => {
        const effectSpy = jest.fn();

        renderHook(() => useEffectAfterFirstTime(effectSpy, [1]));

        // Effect should NOT run on first render
        expect(effectSpy).not.toHaveBeenCalled();
    });

    test("runs effect after dependency change", () => {
        const effectSpy = jest.fn();
        const {rerender} = renderHook(({value}) => useEffectAfterFirstTime(effectSpy, [value]), {
            initialProps: {value: 1}
        });

        // Change dependency and re-render
        rerender({value: 2});
        expect(effectSpy).toHaveBeenCalledTimes(1);

        // Update again
        rerender({value: 3});
        expect(effectSpy).toHaveBeenCalledTimes(2);
    });

    test("throws error if dependencies are empty", () => {
        renderHookShouldThrowError(
            () => useEffectAfterFirstTime(() => {}, []),
            "s/w: useEffectAfterFirstTime must have dependencies"
        );
    });

    test("executes cleanup function on unmount", () => {
        const cleanupSpy = jest.fn();

        const {unmount} = renderHook(() =>
            useEffectAfterFirstTime(() => {
                return cleanupSpy;
            }, [1])
        );

        expect(cleanupSpy).not.toHaveBeenCalled();

        // Unmount the component, triggering cleanup
        unmount();
        waitFor(() => expect(cleanupSpy).toHaveBeenCalledTimes(1));
    });
    test("executes cleanup on dependency change", () => {
        const cleanupSpy = jest.fn();
        const effectSpy = jest.fn(() => cleanupSpy);

        const { rerender, unmount } = renderHook(({ value }) =>
            useEffectAfterFirstTime(effectSpy, [value]), {
            initialProps: { value: 1 }
        });

        rerender({ value: 2 });  // Trigger effect with new dependency
        expect(effectSpy).toHaveBeenCalledTimes(1);

        rerender({ value: 3 });  // Second rerender should trigger cleanup again
        expect(cleanupSpy).toHaveBeenCalledTimes(1);  // Previous cleanup
        expect(effectSpy).toHaveBeenCalledTimes(2);

        unmount();
        expect(cleanupSpy).toHaveBeenCalledTimes(2);  // Final cleanup on unmount
    });



});

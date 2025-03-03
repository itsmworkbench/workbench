import React, {useEffect} from "react";
import {AsyncState, hasData, hasError, isLoading, Kleisli, useKleisli} from "./use.kleisli";
import {defaultError, simpleLoadingDisplay} from "./helpers";

export type DisplayLoadingErrorProps = {
    error: string | string[];
}
export type DisplayLoadingErrors = (props: DisplayLoadingErrorProps) => React.ReactNode;

export type LoadingDisplay = () => React.ReactElement;
export type LoadingOrProps<Input, Output> = {
    input: Input;
    kleisli: Kleisli<Input, Output>;
    Loading?: LoadingDisplay;
    Error?: DisplayLoadingErrors;
    onUnmount?: (output: Output) => void;
    children: (output: Output) => React.ReactNode;
}

/**
 * The top-level function:
 * - Unconditionally calls hooks.
 * - Always returns the same wrapper component.
 */
export function LoadingOr<Input, Output>({
                                             input,
                                             kleisli,
                                             Loading = simpleLoadingDisplay,
                                             Error = defaultError,
                                             children,
                                             onUnmount = () => {},
                                         }: LoadingOrProps<Input, Output>): React.ReactElement {
    // 1. Call your hooks unconditionally
    const state = useKleisli<Input, Output>(kleisli, input);

    useEffect(() => {
        return () => {
            if (hasData(state)) {
                onUnmount(state.data as Output);
            }
        };
    }, [state.data, onUnmount]);

    // 2. Always return the same top-level component:
    //    The conditional logic will happen *inside* the wrapper.
    return (
        <LoadingOrWrapper
            state={state}
            Loading={Loading}
            Error={Error}
            childrenFn={children}
        />
    );
}


export type LoadingOrWrapperProps<Input, Output> = {
    state: AsyncState<Output>;
    Loading?: React.ComponentType | null;
    Error?: DisplayLoadingErrors
    childrenFn: (data: Output) => React.ReactNode;
}

/**
 * The wrapper that decides *what* to render
 * based on the provided `state` (loading, error, data).
 *
 * Importantly, React now always sees *one* component here,
 * so the hook order is stable.
 */
function LoadingOrWrapper<Input, Output>({
                                             state,
                                             Loading,
                                             Error,
                                             childrenFn,
                                         }: LoadingOrWrapperProps<Input, Output>) {
    // Conditionally render the content *within* a stable component structure:
    if (isLoading(state) && Loading) {
        return <Loading/>;
    }
    if (hasError(state)) {
        return Error ? <Error error={state.error}/> : <></>;
    }
    if (hasData(state)) {
        return <>{childrenFn(state.data)}</>;
    }
    console.error("This should never happen: invalid state =>", state);
    return <></>;
}


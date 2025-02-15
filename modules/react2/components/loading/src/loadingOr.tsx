import React, {useEffect} from "react";
import {hasData, hasError, isLoading, Kleisli, useKleisli} from "./use.kleisli";

export type LoadingOrErrorProps = {
    error: string;
}
export type LoadingOrErrorFn = (props: LoadingOrErrorProps) => React.ReactNode;

export type LoadingDisplay = () => React.ReactElement;
export type LoadingOrProps<Input, Output> = {
    input: Input;
    kleisli: Kleisli<Input, Output>;
    Loading?: LoadingDisplay;
    Error?: LoadingOrErrorFn;
    onUnmount?: (output: Output) => void;
    children: (output: Output) => React.ReactNode;
}

export function simpleLoadingDisplay(): React.ReactElement {
    return <div>Loading...</div>;
}


export const defaultError: LoadingOrErrorFn = ({error}): React.ReactElement =>
    <div>Error: {error}</div>;



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
                                         }: {
    state: any;  // Replace `any` with your actual state type
    Loading?: React.ComponentType | null;
    Error?: LoadingOrErrorFn
    childrenFn: (data: Output) => React.ReactNode;
}) {
    // Conditionally render the content *within* a stable component structure:
    if (isLoading(state) && Loading) {
        return <Loading />;
    }
    if (hasError(state)) {
        return Error ?  <Error error={state.error} />:<></> ;
    }
    if (hasData(state)) {
        return <>{childrenFn(state.data as Output)}</>;
    }

    console.error("This should never happen: invalid state =>", state);
    return <></>;
}


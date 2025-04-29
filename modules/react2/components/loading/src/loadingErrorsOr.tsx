import React, {useEffect} from "react";
import {AsyncState, hasData, hasError, isLoading, Kleisli, useKleisli} from "./use.kleisli";
import {defaultError, simpleLoadingDisplay} from "./helpers";
import {DisplayLoadingErrors, LoadingDisplay} from "./loadingOr";
import {ErrorsOr, isErrors, isValue} from "@itsmworkbench/errors";

export type LoadingErrorsOrProps<Input, Output> = {
    input: Input;
    kleisli: Kleisli<Input, ErrorsOr<Output>>;
    Loading?: LoadingDisplay;
    Error?: DisplayLoadingErrors;
    onUnmount?: (output: ErrorsOr<Output>) => void;
    onLoad?: (output: Output) => void;
    children: (output: Output) => React.ReactNode;
}
const emptyUnMount = () => {}
/**
 * The top-level function:
 * - Unconditionally calls hooks.
 * - Always returns the same wrapper component.
 */
export function LoadingErrorsOr<Input, Output>({
                                                   input,
                                                   kleisli,
                                                   Loading = simpleLoadingDisplay,
                                                   Error = defaultError,
                                                   children,
                                                   onLoad,
                                                   onUnmount = emptyUnMount,
                                               }: LoadingErrorsOrProps<Input, Output>): React.ReactElement {
    function onLoadAdapter(output: ErrorsOr<Output>) {
        if (isValue(output))
            onLoad?.(output.value)
    }

    const state = useKleisli<Input, ErrorsOr<Output>>(kleisli, input, {onLoad: onLoadAdapter});

    useEffect(() => {
        return () => {
            if (hasData(state)) {
                onUnmount(state.data);
            }
        };
    }, [state.data, onUnmount]);


    return (
        <LoadingErrorsOrWrapper
            state={state}
            Loading={Loading}
            Error={Error}
            childrenFn={children}
        />
    );
}


export type LoadingErrorsOrWrapperProps<Output> = {
    state: AsyncState<ErrorsOr<Output>>;
    Loading?: React.ComponentType | null;
    Error?: DisplayLoadingErrors
    childrenFn: (data: Output) => React.ReactNode;
}

function LoadingErrorsOrWrapper<Output>({
                                            state,
                                            Loading,
                                            Error,
                                            childrenFn,
                                        }: LoadingErrorsOrWrapperProps<Output>) {
    // Conditionally render the content *within* a stable component structure:
    if (isLoading(state) && Loading) return <Loading/>;
    if (hasError(state)) return Error ? <Error error={state.error}/> : <></>;
    if (hasData(state)) return isErrors(state.data) ? <Error error={state.data.errors}/> : <>{childrenFn(state.data.value)}</>;
    console.error("This should never happen: invalid state =>", state);
    return <></>;
}


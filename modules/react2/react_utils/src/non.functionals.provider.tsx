import {FeatureFlags, FeatureFlagsProvider} from "./react.feature.flags";
import { DebugStateProvider} from "./react.debug";
import React, {ReactNode} from "react";
import {ErrorReporter, ErrorReporterProvider} from "./react.referenced.error";
import {DebugState} from "@itsmworkbench/utils";


export type NonFunctionalsProviderProps = {
    debugState: DebugState
    errorReporter: ErrorReporter
    featureFlags: FeatureFlags
    children: ReactNode
}

export function NonFunctionalsProvider({debugState, featureFlags, errorReporter, children}: NonFunctionalsProviderProps) {
    return <ErrorReporterProvider errorReporter={errorReporter}>
        <DebugStateProvider debugState={debugState}>
            <FeatureFlagsProvider featureFlags={featureFlags}>
                {children}
            </FeatureFlagsProvider>
        </DebugStateProvider></ErrorReporterProvider>
}


//Context, Provider, custom hooks provide safety from change
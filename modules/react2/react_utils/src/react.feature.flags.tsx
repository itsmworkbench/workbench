import {NameAnd} from "@itsmworkbench/utils";
import {makeContextFor, makeContextForState} from "./react_utils";
import React, {ReactNode, useContext, useMemo} from "react";
import {lensBuilder} from "@itsmworkbench/optics";
import {useThrowError} from "./react.report.error";
import {WindowUrlContext} from "./routing/path.name.provider";

export type CommonFeatureFlag<T> = {
    description: string
    value: T
}
export type BooleanFeatureFlag = CommonFeatureFlag<boolean>
export type OptionsFeatureFlag = CommonFeatureFlag<string> & {
    options: string[]
}

export function isBooleanFeatureFlag(flag: CommonFeatureFlag<any>): flag is BooleanFeatureFlag {
    return (flag as any).options === undefined
}

export function isOptionsFeatureFlag(flag: CommonFeatureFlag<any>): flag is OptionsFeatureFlag {
    return (flag as OptionsFeatureFlag).options !== undefined
}

export type FeatureFlag = BooleanFeatureFlag | OptionsFeatureFlag
export type FeatureFlags = NameAnd<FeatureFlag>

export const {use: useOriginalFeatureFlags, Provider: OriginalFeatureFlagsProvider} = makeContextFor<FeatureFlags, 'originalFeatureFlags'>('originalFeatureFlags');

export const {use: useFeatureFlagsState, Provider: FeatureFlagsStateProvider} = makeContextForState<FeatureFlags, 'featureFlags'>('featureFlags');

export function updateFeatureFlagsFromHRef(url: URL, featureFlags: FeatureFlags) {
    let copy: FeatureFlags = featureFlags
    const searchParams = new URLSearchParams(url.search);
    for (const key of Object.keys(featureFlags)) {
        if (searchParams.has(key)) {
            const lens = lensBuilder<FeatureFlags>().focusOn(key).focusOn('value')
            copy = lens.set(copy, searchParams.get(key) === 'true')
        }
    }
    return copy
}

export function clearAllFeatureFlags(featureFlags: FeatureFlags) {
    let copy: FeatureFlags = featureFlags
    for (const key of Object.keys(featureFlags)) {
        const lens = lensBuilder<FeatureFlags>().focusOn(key).focusOn('value')
        copy = lens.set(copy, false)
    }
    return copy
}

export function FeatureFlagsProvider({children, featureFlags}: { children: React.ReactNode, featureFlags: FeatureFlags }) {
    const winUrlOps = useContext(WindowUrlContext)
    const initialState = useMemo<FeatureFlags>(() => {
        if (!winUrlOps) return featureFlags
        const [winUrlData] = winUrlOps
        return updateFeatureFlagsFromHRef(winUrlData.url, featureFlags);
    }, [window.location.href, featureFlags]);
    return <OriginalFeatureFlagsProvider originalFeatureFlags={featureFlags}>
        <FeatureFlagsStateProvider featureFlags={initialState}>{children}</FeatureFlagsStateProvider>
    </OriginalFeatureFlagsProvider>
}

export function useFeatureFlag(name: string): boolean | string {
    const [flags] = useFeatureFlagsState();
    return flags[name]?.value ?? false;
}

export function flagged<Props>(flag: string, Enabled: (p: Props) => ReactNode, Disabled: (p: Props) => ReactNode): (p: Props) => ReactNode {
    return (props: Props) => {
        const f = useFeatureFlag(flag)
        return f ? Enabled(props) : Disabled(props)
    }
}

export function flaggedValue<Props>(flag: string, options: NameAnd<(p: Props) => ReactNode>): (p: Props) => ReactNode {
    const [flags] = useFeatureFlagsState()
    const throwError = useThrowError()
    const f = flags[flag]
    if (isOptionsFeatureFlag(f)) {
        const value = options[f.value]
        if (value === undefined) return throwError('s/w', `Invalid value ${f.value} for feature flag ${flag}`)
        return value
    }
    return throwError('s/w', `Feature flag ${flag} is not an options flag`)
}
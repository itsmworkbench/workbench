import React from "react";

import {DevModeDebug} from "./devmode.debug";
import {DevModeFeatureFlags} from "./devmode.feature.flags";
import {DevModeTranslate} from "./devmode.translate";
import {makeContextFor, makeContextForState, makeUseStateChild, useWindowUrlData} from "@itsmworkbench/react_utils";
import {NameAnd} from "@itsmworkbench/utils";

export type DevModeComponent = () => React.ReactElement;
export type DevModeComponents = NameAnd<DevModeComponent>


const devModeComponents: NameAnd<() => React.ReactElement> = {
    Hide: () => <></>,
    Debug: DevModeDebug,
    FeatureFlags: DevModeFeatureFlags,
    Translate: DevModeTranslate,
};

export const {Provider: DevModeComponentsProvider, use: useDevModeComponents} = makeContextFor("components", devModeComponents);

export type DevModeState = {
    selected: string
}
export const {Provider: DevModeStateForSearchProvider, use: useDevModeState} = makeContextForState<DevModeState, "devModeState">("devModeState");
export const useDevModeSelected = makeUseStateChild<DevModeState, string>(useDevModeState, id => id.focusOn("selected"));


export function DevMode() {
    const components = useDevModeComponents();
    const selectedOps = useDevModeSelected();
    const [urlData] = useWindowUrlData();

    const allowedbyUserType = true;
    const devModeReqestedAndAllowed = allowedbyUserType && urlData.url.searchParams.get("devMode");
    if (!devModeReqestedAndAllowed) return <></>;
    const [selected] = selectedOps;
    const Component = components[selected] || (() => <></>);
    return <div className="dev-mode">
        <hr/>
        <span>nav bar goes here</span>
        <Component/>
    </div>;
}
import React from "react";

import {makeContextFor, makeContextForState, makeUseStateChild} from "@itsmworkbench/react_utils";
import {NameAnd} from "@itsmworkbench/utils";
import {NavigatorPanelForStrings} from "@itsmworkbench/panelnavigator";
import {ClipHeight} from "@itsmworkbench/clip_height";

export type DevModeComponent = () => React.ReactElement;
export type DevModeComponents = NameAnd<DevModeComponent>


export const {Provider: DevModeComponentsProvider, use: useDevModeComponents} = makeContextFor("components");

export type DevModeState = {
    selected: string
    visible: string
}
export const {Provider: DevModeStateForSearchProvider, use: useDevModeState} = makeContextForState<DevModeState, "devModeState">("devModeState");
export const useDevModeSelected = makeUseStateChild<DevModeState, string>(useDevModeState, id => id.focusOn("selected"));
export const useDevModeVisible = makeUseStateChild<DevModeState, string>(useDevModeState, id => id.focusOn("visible"));


export function DevMode() {
    const components = useDevModeComponents();
    const selectedOps = useDevModeSelected();
    const [visible, setVisible] = useDevModeVisible();

    const [selected] = selectedOps;
    if (visible === '') return <></>;
    const Component = components[selected] || (() => <></>);
    const panels = Object.keys(components);
    return <div className="dev-mode">
        <NavigatorPanelForStrings size='small' ops={selectedOps} translatePrefix='devMode' panels={panels}/>
        <ClipHeight maxHeight="200px" scrollable>
            <Component/>
        </ClipHeight>
    </div>;
}
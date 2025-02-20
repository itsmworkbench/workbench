import {GetterSetter, makeContextFor} from "@itsmworkbench/react_utils";
import {NameAnd} from "@itsmworkbench/utils";
import React from "react";
import {useCommonComponents} from "@itsmworkbench/common_components";

export type System = {
    description: string,
}
export type Systems = NameAnd<System>

export const {Provider: SystemsProvider, use: useSystems} = makeContextFor<Systems, 'systems'>('systems')

export type DisplaySystemProps = { name: string, system: System }
export type DisplaySystem = (props: DisplaySystemProps) => React.ReactElement;

export type DisplaySystemsProps = { ops: GetterSetter<string> }
export type DisplaySystems = (props: DisplaySystemsProps) => React.ReactElement;

export type DisplaySystemComponent = {
    DisplaySystems: DisplaySystems
}
export const {Provider: DisplaySystemProvider, use: useDisplaySystem} = makeContextFor<DisplaySystemComponent, 'displaySystem'>('displaySystem')

export const simpleDisplaySystem: DisplaySystemComponent = {
    DisplaySystems: SimpleDisplaySystems
}

export function SimpleDisplaySystems({ops}: DisplaySystemsProps) {
    const {NavPanelLayout, NavPanel} = useCommonComponents()
    const systems = useSystems()
    return <NavPanelLayout>
        {Object.entries(systems).map(([name, system]) =>
            <NavPanel key={name} ops={ops} name={name}{...system} size='small'/>)}
    </NavPanelLayout>
}

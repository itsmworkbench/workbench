import {ReactElement} from "react";
import {makeContextFor, makeRoutingSegmentContextFor} from "@itsmworkbench/react_utils";
import {NameAnd} from "@itsmworkbench/utils";


//It feels that this will grow and become more of a plugin
//At the moment it's just a display sovereign page so not that needed
//However by making it a plugin it is consistant with the others
//We should monitor this

export type SovereignSelectionState = {
    /* The name of the sovereign selected */
    selected: string
}
/** This is the list of all of the sovereign pages that we have. The 'selected' in the above state is for this */
export type SovereignStatePlugins = {
    plugins:NameAnd<SovereignStatePlugin>,
    UnknownDisplay: DisplaySovereignPage
}


export type SovereignStatePlugin = {
    plugin: 'sovereign'
    display: DisplaySovereignPage,
}

export type DisplaySovereignPage = (props: DisplaySovereignPageProps) => ReactElement
export type DisplaySovereignPageProps = {}


export function makeSovereignStatePlugin(display: DisplaySovereignPage): SovereignStatePlugin {
    return {plugin: 'sovereign', display}
}

export const {use: useSovereignStatePlugins, Provider: SovereignStatePluginsProvider} = makeContextFor<SovereignStatePlugins, 'plugins'>('plugins')

export const {use: useSelectedSovereign, Provider: SovereignStateProvider} = makeRoutingSegmentContextFor('routing0', 0)



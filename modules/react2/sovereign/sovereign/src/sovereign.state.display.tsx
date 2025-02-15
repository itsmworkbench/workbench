import {DisplaySovereignPageProps, useSelectedSovereign, useSovereignStatePlugins} from "./sovereign.selection.state";
import React from "react";


export function DisplaySelectedSovereignPage(props: DisplaySovereignPageProps) {
    const [selected] = useSelectedSovereign()
    const {plugins, UnknownDisplay} = useSovereignStatePlugins()
    const plugin = selected ? plugins[selected] : Object.values(plugins)[0];
    if (!plugin) return <UnknownDisplay/>
    const Display = plugin.display
    return <Display {...props}/>
}

// export const SelectedSovereignPagePlugin = makeSovereignStatePlugin(DisplaySelectedSovereignPage)
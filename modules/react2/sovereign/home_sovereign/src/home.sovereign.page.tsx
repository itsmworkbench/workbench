import {DisplaySovereignPage, makeSovereignStatePlugin, useSelectedSovereign} from "@itsmworkbench/sovereign";
import React from "react";
import {NavigatorPanel, NavigatorPanelDefns} from "@itsmworkbench/panelnavigator";

export const HomeSovereignPage = (panels: NavigatorPanelDefns): DisplaySovereignPage =>
    () => {
        const ops = useSelectedSovereign()
        return <NavigatorPanel panels={panels} ops={ops}/>
    };

export function HomeSovereignPagePlugin(panels: NavigatorPanelDefns) {
    return makeSovereignStatePlugin(HomeSovereignPage(panels))
}


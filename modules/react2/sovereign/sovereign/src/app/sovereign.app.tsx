import React from "react";
import {useSovereignAppComponents} from "./sovereign.app.components";
import {DisplaySelectedSovereignPage} from "../sovereign.state.display";
import {DevMode} from "@itsmworkbench/devmode";

export type SearchAppProps = {  }

export function SovereignApp({}: SearchAppProps) {
    const {SovereignAppLayout, SovereignHeader, SovereignFooter} = useSovereignAppComponents()
    return <SovereignAppLayout>
        <SovereignHeader/>
        <DevMode />
        <DisplaySelectedSovereignPage/>
        <SovereignFooter/>
    </SovereignAppLayout>
}


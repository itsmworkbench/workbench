import React from "react";
import {useSovereignAppComponents} from "./sovereign.app.components";
import {DisplaySelectedSovereignPage} from "../sovereign.state.display";

export type SearchAppProps = {  }

export function SovereignApp({}: SearchAppProps) {
    const {SovereignAppLayout, SovereignHeader, SovereignFooter} = useSovereignAppComponents()
    return <SovereignAppLayout>
        <SovereignHeader/>
        <DisplaySelectedSovereignPage/>
        <SovereignFooter/>
    </SovereignAppLayout>
}


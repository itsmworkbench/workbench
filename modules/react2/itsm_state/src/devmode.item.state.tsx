import {DevModeComponent} from "@itsmworkbench/devmode";

import React from "react";
import {useItsmState} from "./itsm.state";

export const itsmState = 'ITSM State'
export const DevModeItsmState: DevModeComponent = () => {
    const [state] = useItsmState()
    return <pre>{JSON.stringify(state, null, 2)}</pre>
}
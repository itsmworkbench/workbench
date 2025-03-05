import {DevModeComponent} from "@itsmworkbench/devmode";
import {useRememberChatCompletion} from "./ai.react";
import React from "react";

export const DevModeAi: DevModeComponent = () => {
    const [remembered, setRemembered] = useRememberChatCompletion()
    return <pre>{JSON.stringify(remembered, null, 2)}</pre>
}
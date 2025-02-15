import {DebugLog, DebugState, makeDebugLog} from "@itsmworkbench/utils";
import {makeContextForState} from "./react_utils";


export const {use: useDebugState, Provider: DebugStateProvider} = makeContextForState<DebugState, "debugState">("debugState");

export function useDebug(name: string): DebugLog {
    const [debugState] = useDebugState();
    return makeDebugLog(debugState, name);
}


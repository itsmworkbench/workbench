
import React, {Context, ReactElement, ReactNode, useContext, useMemo} from "react";
import {uppercaseFirstLetter} from "@itsmworkbench/utils";
import {useWindowUrlData} from "./path.name.provider";
import {useDebug} from "../react.debug";
import {GetterSetter} from "../react_utils";
import {useThrowError} from "../react.report.error";

export const routingDebug = 'routing'

export type RoutingSegmentOps = GetterSetter<string>

export type RoutingContextResults = {
    use: () => RoutingSegmentOps
    Provider: (props: RoutingProviderProps) => ReactElement
    context: Context<RoutingSegmentOps | undefined>
}

type RoutingProviderProps = { children: ReactNode, updateWindowsState?: boolean }


export function makeRoutingSegmentContextFor(
    field: string,
    segment: number
): RoutingContextResults {

    const context = React.createContext<RoutingSegmentOps | undefined>(undefined);

    function useRouting() {
        const debug = useDebug(routingDebug)
        const contextValue = useContext(context);
        const throwError = useThrowError();
        if (contextValue === undefined) {
            const upperedName = uppercaseFirstLetter(field);
            throwError('s/w', `use${upperedName} must be used within a ${upperedName}Provider`);
        }
        debug('useRouting', field, contextValue)
        return contextValue!;
    }

    // Provider component dynamically named like `${field}Provider`
    function RoutingProvider(props: RoutingProviderProps) {
        const debug = useDebug(routingDebug)
        const [urlData, setUrlData] = useWindowUrlData()
        const {parts, url} = urlData
        const value = parts[segment] || '';
        debug('RoutingProvider', segment, field, '=', value)
        const ops: GetterSetter<string> = useMemo(() => [value, name => {
            const actualName = typeof name === 'function' ? name(value) : name
            const newParts = [...parts];
            newParts[segment] = actualName;
            const newUrl = new URL(url.toString());
            newUrl.pathname = `/${newParts.join('/')}`;  // bit dirty...
            debug('RoutingProvider', segment, actualName, 'pushState', newUrl.toString())
            const updateWindowsState = props.updateWindowsState !== false;
            debug('RoutingProvider', 'updateWindowsState', updateWindowsState)
            if (updateWindowsState) window.history.pushState(null, '', newUrl.toString());
            setUrlData({...urlData, parts: newParts, url: newUrl})
        }], [value, parts[0] || '', parts[1] || ''])
        return <context.Provider value={ops}>{props.children}</context.Provider>;
    }

    // Return context, hook, and provider with dynamic names
    return {use: useRouting, Provider: RoutingProvider, context};
}

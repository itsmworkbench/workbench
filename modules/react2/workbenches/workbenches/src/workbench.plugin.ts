import {ReactElement} from "react";
import {NameAnd} from "@itsmworkbench/utils";
import {makeContextFor} from "@itsmworkbench/react_utils";
import {Icon} from "@itsmworkbench/icons";


export type WorkbenchDisplayMode = 'edit' | 'view' | 'smallView'
export type DisplayWorkbenchProps<T> = {initial: T, displayMode: WorkbenchDisplayMode};
export type DisplayWorkbench<T> = (props: DisplayWorkbenchProps<T>) => ReactElement;

export type WorkbenchPlugins = NameAnd<WorkbenchPlugin<any>>
export type WorkbenchPlugin<T> = {
    plugin: 'workbench';
    /** For example email, sql, ldap */
    name: string;
    icon: Icon
    description?: string;
    empty: T
    Display: DisplayWorkbench<T>;
};

export const {use: useWorkbenchPlugins, Provider: WorkbenchPluginsProvider} = makeContextFor<WorkbenchPlugins, 'workbenchPlugins'>('workbenchPlugins')
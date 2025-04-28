import {ReactElement} from "react";
import {NameAnd} from "@itsmworkbench/utils";
import {makeContextFor} from "@itsmworkbench/react_utils";
import {Icon} from "@itsmworkbench/icons";

export type DisplayWorkbenchProps = {};

export type DisplayWorkbench = (props: DisplayWorkbenchProps) => ReactElement;

export type WorkbenchPlugins = NameAnd<WorkbenchPlugin>
export type WorkbenchPlugin = {
    plugin: 'workbench';
    /** For example email, sql, ldap */
    name: string;
    icon: Icon
    description?: string;
    Display: DisplayWorkbench;
};

export const {use: useWorkbenchPlugins, Provider: WorkbenchPluginsProvider} = makeContextFor<WorkbenchPlugins, 'workbenchPlugins'>('workbenchPlugins')
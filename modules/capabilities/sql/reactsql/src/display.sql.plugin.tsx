import React from "react";
import { ActionPlugIn, ActionPluginDetails } from "@itsmworkbench/react_core";
import { DisplaySqlWorkbench, DisplaySqlWorkbenchProps } from "./sql.workbench";
import { LensState } from "@focuson/state";


export const displaySqlPlugin = <S, State> (): ActionPlugIn<S, State, DisplaySqlWorkbenchProps<S>> =>
  ( props: ( s: LensState<S, State, any> ) => DisplaySqlWorkbenchProps<S> ): ActionPluginDetails<S, State, DisplaySqlWorkbenchProps<S>> => ({
    by: "SQLWorkbench",
    props,
    render: ( s, props ) => <DisplaySqlWorkbench {...props} />
  });
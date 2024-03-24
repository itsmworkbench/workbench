import React from "react";
import { ActionPluginDetails } from "@itsmworkbench/react_core";
import { DisplaySqlWorkbench, DisplaySqlWorkbenchProps } from "./sql.workbench";
import { LensState } from "@focuson/state";


export const displaySqlPlugin = <S, > ( props: <State, >( s: LensState<State, S, any> ) => DisplaySqlWorkbenchProps<S> ): ActionPluginDetails<S, DisplaySqlWorkbenchProps<S>> => ({
  by: "SQLWorkbench",
  props,
  render: ( s,props ) => <DisplaySqlWorkbench {...props} />
});
import React from "react";
import { ActionPlugIn, ActionPluginDetails } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";
import { DisplayEmailWorkbench, DisplayEmailWorkbenchProps } from "./mailer.workbench";


export const displayMailerPlugin = <S, State> (): ActionPlugIn<S, State, DisplayEmailWorkbenchProps<S>> =>
  ( props: ( s: LensState<S, State, any> ) => DisplayEmailWorkbenchProps<S> ): ActionPluginDetails<S, State, DisplayEmailWorkbenchProps<S>> => ({
    by: "EmailWorkbench",
    props,
    render: ( s, props ) => <DisplayEmailWorkbench {...props} />
  });
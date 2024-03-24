import React from "react";
import { ActionPluginDetails } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";
import { DisplayEmailWorkbench, DisplayEmailWorkbenchProps } from "./mailer.workbench";


export const displayMailerPlugin = <S, > ( props: <State, >( s: LensState<State, S, any> ) => DisplayEmailWorkbenchProps<S> ): ActionPluginDetails<S, DisplayEmailWorkbenchProps<S>> => ({
  by: "EmailReviewTicketWorkbench",
  props,
  render: ( props ) => <DisplayEmailWorkbench {...props} />
});
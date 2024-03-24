import React from "react";
import { ActionPluginDetails } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";
import { DisplayReviewTicketWorkbench, DisplayReviewTicketWorkbenchProps } from "./review.ticket.workbench";


export const displayReviewTicketWorkbench = <S, > ( props: <State, >( s: LensState<State, S, any> ) => DisplayReviewTicketWorkbenchProps<S> ): ActionPluginDetails<S, DisplayReviewTicketWorkbenchProps<S>> => ({
  by: "ReviewTicketWorkbench",
  props,
  render: ( s, props ) => <DisplayReviewTicketWorkbench {...props} />
});


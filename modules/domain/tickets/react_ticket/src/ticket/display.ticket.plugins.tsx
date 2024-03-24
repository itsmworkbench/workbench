import React from "react";
import { ActionPlugIn, ActionPluginDetails } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";
import { DisplayReviewTicketWorkbench, DisplayReviewTicketWorkbenchProps } from "./review.ticket.workbench";


export const displayReviewTicketWorkbench = <S, State> (): ActionPlugIn<S, State, DisplayReviewTicketWorkbenchProps<S>> => ( props: ( s: LensState<S, State, any> ) => DisplayReviewTicketWorkbenchProps<S> ): ActionPluginDetails<S, State, DisplayReviewTicketWorkbenchProps<S>> => ({
  by: "ReviewTicketWorkbench",
  props,
  render: ( s, props ) => <DisplayReviewTicketWorkbench {...props} />
});


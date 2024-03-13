import { LensProps, LensProps2, LensProps3 } from "@focuson/state";
import { TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { PhaseName } from "@itsmworkbench/domain";
import { Button } from "@mui/material";
import React from "react";
import { TicketType } from "@itsmworkbench/tickettype";
import { allWorkbenchEvents, findActionInEventsFor, findWorkbenchEventFor, lastTicketType } from "@itsmworkbench/knowledge_articles";
import { Event } from "@itsmworkbench/events";

//this is driven from the events...
//we go looking for an event, and if we don't find it we use the most recent ticket type
//i.e. chain:
// see if there is an event already (latest) if so ... use the data in it
// see if there is a ticket type event (latest), if so use the data in it
// set to empty

//So for this we need to consider where the tempdata is. Might as well make it 'tempWorkspace data' and it an any


export interface OpenWorkbenchButtonProps<S> extends LensProps3<S, Event[], any, TabPhaseAndActionSelectionState, any> {
  label: string
  phase: PhaseName
  action: string
}
export function OpenWorkbenchButton<S> ( { state, label, phase, action }: OpenWorkbenchButtonProps<S> ) {
  function onClick () {
    const events = state.optJson1 () || []
    const previous = findActionInEventsFor ( events, phase, action )
    state.state2 ().setJson ( previous, '' )
  }
  return <Button onClick={() => {}}>{label}</Button>
}


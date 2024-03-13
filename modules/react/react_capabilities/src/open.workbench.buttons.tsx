import { LensProps, LensProps2 } from "@focuson/state";
import { TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { PhaseName } from "@itsmworkbench/domain";
import { Button } from "@mui/material";
import React from "react";
import { TicketType } from "@itsmworkbench/tickettype";
import { allWorkbenchEvents, findWorkbenchEventFor, lastTicketType } from "@itsmworkbench/knowledge_articles";


//this is driven from the events...
//we go looking for an event, and if we don't find it we use the most recent ticket type
//i.e. chain:
// see if there is an event already (latest) if so ... use the data in it
// see if there is a ticket type event (latest), if so use the data in it
// set to empty

//So for this we need to consider where the tempdata is. Might as well make it 'tempWorkspace data' and it an any


export interface OpenWorkbenchButtonProps<S> extends LensProps2<S, Event[], TabPhaseAndActionSelectionState, any> {
  label: string
  phase: PhaseName
  action: string
}
export function openWorkbenchButton<S> ( { state, label, phase, action }: OpenWorkbenchButtonProps<S> ) {
  const events = state.optJson1 () || []
  const workBenchEvent = findWorkbenchEventFor ( events, phase, action )
  const ticketType: TicketType = lastTicketType ( events )
  return <Button onClick={() => {}}>{label}</Button>
}


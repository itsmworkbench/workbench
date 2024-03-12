import React from "react";
import { LensProps3 } from "@focuson/state";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { EventsAndEnriched } from "@itsmworkbench/react_core";


export interface DisplayTicketListSelectionState {
  workspaceTab?: string
  ticketId?: string
}
export function DisplayTicketList<S, WS extends DisplayTicketListSelectionState> ( { state }: LensProps3<S, string[], WS, EventsAndEnriched, any> ) {
  const ticketNames = state.state1 ().optJson () || []
  return (<List>
    {ticketNames.map ( ( ticket, index ) => (
      <ListItem
        button
        onClick={() => {
          let id = `itsm/me/ticketevents/${ticket}`;
          console.log ( 'Clicked in DisplayTicketList', id, state.state2 ().optJson () )
          const oldSelectState = state.state2 ().optJson () || {} as WS
          let events = state.state3 ().optJson () || { events: [], enrichedEvents: [] }
          if ( oldSelectState.ticketId !== id ) {
            events = { events: [], enrichedEvents: [] }
          }
          const newSelectState = { ...oldSelectState, ticketId: id, workspaceTab: 'chat' }
          state.state23 ().setJson ( newSelectState, events, 'Clicked in DisplayTicketList' )
        }}
        key={ticket}
      >
        <ListItemText primary={ticket}/>
      </ListItem>
    ) )}
  </List>);

}

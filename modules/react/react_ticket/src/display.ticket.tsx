import React from "react";
import { LensProps3 } from "@focuson/state";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { EventsAndEnriched } from "@itsmworkbench/react_core";

export function DisplayTicketList<S> ( { state }: LensProps3<S, string[], string, EventsAndEnriched, any> ) {
  const ticketNames = state.state1 ().optJson () || []
  return (<List>
    {ticketNames.map ( ( ticket, index ) => (
      <ListItem
        button
        onClick={() => {
          let id = `itsm/me/ticketevents/${ticket}`;
          console.log ( 'Clicked in DisplayTicketList', id, state.state2 ().optJson () )
          if ( state.state2 ().optJson () === id ) return
          state.state23 ().setJson ( id, { events: [], enrichedEvents: [] }, 'Clicked in DisplayTicketList' )
        }}
        key={ticket}
      >
        <ListItemText primary={ticket}/>
      </ListItem>
    ) )}
  </List>);

}

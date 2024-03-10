import React from "react";
import { LensProps2 } from "@focuson/state";
import { List, ListItem, ListItemText } from "@material-ui/core";

export function DisplayTicketList<S> ( { state }: LensProps2<S, string[], string|undefined, any> ) {
  const ticketNames = state.state1 ().optJson () || []
  return (<List>
    {ticketNames.map ( ( ticket, index ) => (
      <ListItem
        button
        onClick={() => state.state2 ().setJson ( ticket, 'Clicked in DisplayTicketList' )}
        key={ticket}
      >
        <ListItemText primary={ticket}/>
      </ListItem>
    ) )}
  </List>);

}

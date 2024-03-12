import React from "react";
import { LensProps3 } from "@focuson/state";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { EventsAndEnriched, WorkspaceSelectionState } from "@itsmworkbench/react_core";
import { ColumnLeftMainState } from "@itsmworkbench/components/dist/src/layouts/column.left.main.bottom";


export interface DisplayTicketListSelectionState<Tabs extends WorkspaceSelectionState> {
  tabs?: Tabs
  ticketId?: string
  mainScreen?: ColumnLeftMainState
}
export function DisplayTicketList<S, WS extends DisplayTicketListSelectionState<Tabs>, Tabs extends WorkspaceSelectionState> ( { state }: LensProps3<S, string[], WS, EventsAndEnriched, any> ) {
  const ticketNames = state.state1 ().optJson () || [];
  const selectedTicketId = state.state2 ().optJson ()?.ticketId;

  return (
    <List>
      {ticketNames.map ( ( ticket, index ) => {
        let id = `itsm/me/ticketevents/${ticket}`;
        const isSelected = selectedTicketId === id;

        return (
          <ListItem
            button
            selected={isSelected}
            onClick={() => {
              console.log ( 'Clicked in DisplayTicketList', id, state.state2 ().optJson () );
              const oldSelectState = state.state2 ().optJson () || {} as WS;
              let events = state.state3 ().optJson () || { events: [], enrichedEvents: [] };
              if ( oldSelectState.ticketId !== id ) events = { events: [], enrichedEvents: [] };
              const newSelectState = { ...oldSelectState, ticketId: id, tabs: { workspaceTab: 'chat' } , mainScreen:{drawerOpen: false}};
              state.state23 ().setJson ( newSelectState, events, 'Clicked in DisplayTicketList' );
            }}
            key={ticket}
          >
            <ListItemText primary={ticket}/>
          </ListItem>
        );
      } )}
    </List>
  );
}
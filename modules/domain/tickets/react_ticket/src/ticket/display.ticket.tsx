import React from "react";
import { LensProps3 } from "@focuson/state";
import { List, ListItem, ListItemText } from "@material-ui/core";
import { WorkspaceSelectionState } from "@itsmworkbench/react_core";
import { MainAppMainState } from "@itsmworkbench/components";


export interface DisplayTicketListSelectionState<Tabs extends WorkspaceSelectionState> {
  tabs?: Tabs
  ticketId?: string
  mainScreen?: MainAppMainState
}
export function DisplayTicketList<S, WS extends DisplayTicketListSelectionState<Tabs>, Tabs extends WorkspaceSelectionState> ( { state }: LensProps3<S, string[], WS, any, any> ) {
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
              let forTicket = state.state3 ().optJson () || {} as any;
              if ( oldSelectState.ticketId !== id ) forTicket = {} as any;
              console.log ( 'display ticket. forTicket', forTicket )
              const newSelectState = { ...oldSelectState, ticketId: id, tabs: { workspaceTab: 'chat' }, mainScreen: { drawerOpen: false } };
              state.state23 ().setJson ( newSelectState, forTicket, 'Clicked in DisplayTicketList' );
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
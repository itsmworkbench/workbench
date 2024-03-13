import { LensProps } from "@focuson/state";
import { WorkspaceSelectionState } from "@itsmworkbench/react_core";
import { MainAppMainState } from "@itsmworkbench/components/dist/src/layouts/column.left.main.bottom";
import React, { ReactElement } from "react";
import Button from "@mui/material/Button";
import { ButtonProps } from "@mui/material";


export interface NewTicketState {
  tabs?: WorkspaceSelectionState
  ticketId?: string
  mainScreen?: ColumnLeftMainState
}

export interface NewTicketButtonProps<S, W> extends LensProps<S, W, any>, ButtonProps {

}
export function NewTicketButton<S, W extends NewTicketState> ( { state, children, ...rest }: NewTicketButtonProps<S, W> ): ReactElement {
  return <Button {...rest} variant="contained"
                 onClick={() => {
                   const oldSelectState = state.optJson () || {} as W;
                   const newSelectState = {
                     ...oldSelectState,
                     ticketId: undefined,
                     tabs: { workspaceTab: 'newTicket' },
                     mainScreen: { drawerOpen: false }
                   };
                   state.setJson ( newSelectState, '' );
                 }}>New Ticket</Button>
}
import { LensProps, LensProps2 } from "@focuson/state";
import React from "react";
import { FocusedTextArea, FocusedTextInput } from "@itsmworkbench/components";
import { Button } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { SideEffect } from "@itsmworkbench/react_core";
import { AddNewTicketSideEffect, NewTicketData } from "./new.ticket.sideeffect";


export interface NewTicketProps<S> extends LensProps2<S, NewTicketData, SideEffect[], any> {
}
export function DisplayNewTicket<S> ( { state }: NewTicketProps<S> ) {
  const errors = state.optJson1 ()?.errors || []
  let ticketState = state.state1 ();
  return <>
    {errors.length > 0 && <div>{errors.join ( '\n' )}</div>}
    <p>New Ticket</p>
    <p>Ticket name</p>
    <FocusedTextInput state={ticketState.focusOn ( 'name' )}/>
    <p>Ticket contents - please cut and paste it here</p>
    <FocusedTextArea state={ticketState.focusOn ( 'ticket' )}/>
    <Button variant="contained" color="primary" endIcon={<SendIcon/>} onClick={() => {
      const se: AddNewTicketSideEffect = {
        command: 'addNewTicket',
        organisation: ticketState.optJson ()?.organisation || 'me', //ok this bit is a hack for the demo.
        name: ticketState.optJson ()?.name || '',
        ticket: ticketState.optJson ()?.ticket || ''
      }
      const existing = state.optJson2 () || []
      console.log ( 'adding side effect', se, 'to', existing )
      state.state2 ().setJson ( [ ...existing, se ], 'add new ticket pressed' )
    }}>Create or Replace</Button>
  </>
}
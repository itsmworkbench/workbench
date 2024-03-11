import { LensProps2 } from "@focuson/state";
import React from "react";
import { DisplayJson, FocusedTextArea, FocusedTextInput } from "@itsmworkbench/components";
import { Button } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { SideEffect } from "@itsmworkbench/react_core";
import { AddNewTicketSideEffect, NewTicketData } from "./new.ticket.sideeffect";
import { AiNewTicketSideEffect } from "./ai.ticket.sideeffect";


export interface NewTicketProps<S> extends LensProps2<S, NewTicketData, SideEffect[], any> {
}
export function DisplayNewTicket<S> ( { state }: NewTicketProps<S> ) {
  const errors = state.optJson1 ()?.errors || []
  let ticketState = state.state1 ();
  const se: AddNewTicketSideEffect = {
    command: 'addNewTicket',
    ...ticketState.json ()
  }
  const ai: AiNewTicketSideEffect = {
    ...se,
    command: 'aiNewTicket',
  }
  const existing = state.optJson2 () || []
  return <>
    {errors.length > 0 && <div>{errors.join ( '\n' )}</div>}
    <p>New Ticket</p>
    <p>Ticket name</p>
    <FocusedTextInput state={ticketState.focusOn ( 'name' )}/>
    <p>Ticket contents - please cut and paste it here</p>
    <FocusedTextArea state={ticketState.focusOn ( 'ticket' )} rows={16}/>
    <Button variant="contained" color="primary" endIcon={<SendIcon/>} onClick={() => {
      state.state2 ().setJson ( [ ...existing, ai ], 'calc variables' )
    }}>Calc variables</Button>
    <p>Variables</p>
    <DisplayJson json={ticketState.focusOn ( 'aiAddedVariables' ).optJson ()}/>
    <Button variant="contained" color="primary" endIcon={<SendIcon/>} onClick={() => {
      state.state2 ().setJson ( [ ...existing, se ], 'add new ticket pressed' )
    }}>Create or Replace</Button>
  </>
}
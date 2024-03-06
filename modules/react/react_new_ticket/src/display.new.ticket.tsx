import { LensProps, LensProps2 } from "@focuson/state";
import React from "react";
import { FocusedTextArea, FocusedTextInput } from "@itsmworkbench/components";
import { Button } from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import { SideEffect } from "@itsmworkbench/react_core";
import { NewTicketData } from "./new.ticket.sideeffect";


export interface NewTicketProps<S> extends LensProps2<S, NewTicketData, SideEffect[], any> {
}
export function DisplayNewTicket<S> ( { state }: NewTicketProps<S> ) {
  const errors = state.optJson1 ()?.errors || []
  let ticketState = state.state1 ();
  return <>
    {errors.length > 0 && <div>{errors.join ( '\n' )}</div>}
    <FocusedTextInput state={ticketState.focusOn ( 'name' )}/>
    <FocusedTextArea state={ticketState.focusOn ( 'description' )}/>
    <Button variant="contained" color="primary" endIcon={<SendIcon/>} onClick={() => {}}>Create or Replace</Button>
  </>
}
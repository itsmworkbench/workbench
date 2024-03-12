import React from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Alert from '@mui/material/Alert';
import { AddNewTicketSideEffect, NewTicketData } from './new.ticket.sideeffect';
import { SideEffect } from "@itsmworkbench/react_core";
import { LensProps2 } from "@focuson/state";
import { AiNewTicketSideEffect } from "./ai.ticket.sideeffect";
import { DisplayJson, FocusedTextArea, FocusedTextInput } from "@itsmworkbench/components";
import { SelectTicketType } from "@itsmworkbench/react_tickettype";
import { Box } from '@mui/material';

interface NewTicketProps<S> extends LensProps2<S, NewTicketData, SideEffect[], any> {}

export const DisplayNewTicket = <S, > ( { state }: NewTicketProps<S> ) => {
  const errors = state.optJson1 ()?.errors || [];
  let ticketState = state.state1 ();
  const se: AddNewTicketSideEffect = {
    command: 'addNewTicket',
    ...ticketState.json ()
  };
  const ai: AiNewTicketSideEffect = {
    ...se,
    command: 'aiNewTicket',
  };
  const existing = state.optJson2 () || [];

  return (
    <Box sx={{ '& > *': { mb: 2 } }}> {/* This applies margin-bottom to all immediate children */}

      {errors.length > 0 && (
        <Alert severity="error">{errors.map ( ( error, index ) => <div key={index}>{error}</div> )}</Alert>
      )}

      <Typography variant="h6">New Ticket</Typography>

      <FocusedTextInput
        variant="outlined"
        fullWidth
        label="Ticket Name"
        state={ticketState.focusOn ( 'name' )}
      />
      <SelectTicketType state={ticketState.focusOn ( 'ticketType' )}/>

      <FocusedTextArea
        variant="outlined"
        fullWidth
        label="Ticket Contents"
        multiline
        rows={16}
        state={ticketState.focusOn ( 'ticket' )}
      />

      <Button
        variant="contained"
        color="primary"
        endIcon={<SendIcon/>}
        onClick={() => state.state2 ().setJson ( [ ...existing, ai ], 'calc variables' )}
      >
        Calc variables
      </Button>

      <Typography>Variables</Typography>
      <DisplayJson json={ticketState.focusOn ( 'aiAddedVariables' ).optJson ()}/>

      <Button
        variant="contained"
        color="primary"
        endIcon={<SendIcon/>}
        onClick={() => state.state2 ().setJson ( [ ...existing, se ], 'add new ticket pressed' )}
      >
        Create or Replace
      </Button>
    </Box>
  );
};

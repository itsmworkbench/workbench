import { LensProps2 } from "@focuson/state";
import { getCurrentStep, NewTicketWizardData } from "./new.ticket.wizard.domain";
import React from "react";
import { NextNewWizardStepButton, PreviousNewWizardStepButton } from "./new.ticket.wizard.next.prev";
import { SideEffect } from "@itsmworkbench/react_core";
import { ApprovalStateSelect, SelectTicketTypeProps, TicketTypeSelect, ValidateInvolvedPartiesCheckbox } from "@itsmworkbench/react_tickettype";
import { Grid, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";


export function SelectTicketTypeForNewWizard<S> ( { state, readonly }: SelectTicketTypeProps<S> ) {
  const disabled = readonly === true;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6} sx={{ paddingRight: 4 }}>
        <Typography variant="body1" gutterBottom>
          In order to help you process this ticket, we need to know some details about it.
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ marginTop: 2 }}>
          At the beginning, we don't have any 'knowledge articles'. As you process tickets, we will generate these for you.
          These articles hold the information about how to process a ticket of a certain type.
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          The ticket type you select on the right just helps us to know what kind of ticket you are processing, and allows us to create a checklist for you,
          and generate the knowledge articles for you.
        </Typography>
      </Grid>
      <Grid item xs={12} md={6} container direction="column" spacing={2}>
        <Grid item>
          <TicketTypeSelect state={state.focusOn ( 'ticketType' )} disabled={disabled}/>
        </Grid>
        <Grid item>
          <ApprovalStateSelect state={state.focusOn ( 'approvalState' )} disabled={disabled}/>
        </Grid>
        <Grid item>
          <ValidateInvolvedPartiesCheckbox state={state.focusOn ( 'validateInvolvedParties' )} disabled={disabled}/>
        </Grid>
      </Grid>
    </Grid>
  );
}

export function NewHowToProcessTicket<S> ( { state }: LensProps2<S, NewTicketWizardData, SideEffect[], any> ) {
  let stepState = state.state1 ().focusOn ( 'currentStep' );
  let ticketState = state.state1 ().focusOn ( 'ticketTypeDetails' );
  const currentStep = getCurrentStep ( stepState )
  const existing = state.optJson2 () || [];
  let wizardData = state.optJson1 () || {};
  const se = {
    command: 'addNewTicket',
    organisation: 'me',
    ...wizardData
  };
  console
  return <>
    <SelectTicketTypeForNewWizard state={ticketState}/>
    <PreviousNewWizardStepButton state={stepState}/>
    {/*<NextNewWizardStepButton state={stepState}/>*/}
    <Button
      variant="contained"
      color="primary"
      endIcon={<SendIcon/>}
      onClick={() => state.state2 ().setJson ( [ ...existing, se ], 'add new ticket pressed' )}
    >
      Create or Replace Ticket
    </Button>
  </>
}

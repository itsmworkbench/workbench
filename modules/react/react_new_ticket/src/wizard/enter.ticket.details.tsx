import React from "react";
import { LensProps, LensProps2 } from "@focuson/state";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { NewTicketWizardData, TicketSourceAnd } from "./new.ticket.wizard.domain";
import { NextNewWizardStepButton, PreviousNewWizardStepButton } from "./new.ticket.wizard.next.prev";
import Alert from "@mui/material/Alert";
import { FocusedTextArea, FocusedTextInput, mustBeIdentifier } from "@itsmworkbench/components/dist/src/text/textarea";
import { SelectTicketType } from "@itsmworkbench/react_tickettype/dist/src/select.ticket.type";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { DisplayJson } from "@itsmworkbench/components/dist/src/displayRaw/display.json";
import { SideEffect } from "@itsmworkbench/react_core";
import { AiNewTicketSideEffect } from "../ai.ticket.sideeffect";
import { NewTicketData } from "../new.ticket.sideeffect";
import { TicketTypeDetails } from "@itsmworkbench/tickettype";
import { TicketVariables } from "@itsmworkbench/ai_ticketvariables";
import { Lenses } from "@focuson/lens";

interface EnterTicketDetailsComp<S> extends LensProps2<S, NewTicketWizardData, SideEffect[], any> {
  next: ( enabled: boolean ) => React.ReactElement
  prev: React.ReactElement
}


export const enterTicketDetailsComp = <S extends any> (): TicketSourceAnd<React.ComponentType<EnterTicketDetailsComp<S>>> => ({
  manually: ManuallyTicketDetailsEntry<S>,
  fromAzureDevOps: NotSupportYetTicketDetailsEntry<S>,
  fromJira: NotSupportYetTicketDetailsEntry<S>,
  fromServiceNow: NotSupportYetTicketDetailsEntry<S>
})

export function EnterTicketDetails<S> ( { state }: LensProps2<S, NewTicketWizardData, SideEffect[], any> ) {
  const ticketSource = state.optJson1 ()?.whereIsTicket;
  if ( ticketSource === undefined ) throw Error ( 'No ticket source' );
  console.log ( 'ticketSource', ticketSource, state );
  const Comp = enterTicketDetailsComp<S> ()[ ticketSource ];
  let stepState = state.state1 ().focusOn ( 'currentStep' );
  console.log ( 'comp', Comp, enterTicketDetailsComp, stepState )
  if ( Comp === undefined ) throw Error ( 'No component for ticket source ' + ticketSource );
  return <Comp state={state}
               next={enabled => <NextNewWizardStepButton state={stepState} enabled={enabled}/>}
               prev={<PreviousNewWizardStepButton state={stepState}/>}/>
}

export function ManuallyTicketDetailsEntry<S> ( { state, next, prev }: EnterTicketDetailsComp<S> ) {
  const hackedStateForAi = state.state1 ().copyWithLens ( Lenses.identity<any> () ).focusOn ( 'tempData' ).focusOn ( 'newTicket' ).focusOn ( 'aiAddedVariables' )
  return (
    <Box sx={{ '& > *': { mb: 2 } }}> {/* This applies margin-bottom to all immediate children */}

      <Typography variant="h6">New Ticket</Typography>

      <FocusedTextInput
        variant="outlined"
        fullWidth
        label="Ticket Name"
        errorFn={mustBeIdentifier ( 'Can only contain letters, numbers, and underscores' )}
        state={state.state1 ().focusOn ( 'ticketName' )}
      />
      <FocusedTextArea
        variant="outlined"
        fullWidth
        label="Ticket Contents"
        multiline
        rows={12}
        state={state.state1 ().focusOn ( 'ticketDetails' )}
      />

      <Button
        variant="contained"
        color="primary"
        endIcon={<SendIcon/>}
        onClick={() => {
          //Just hacking it while experimental
          const data = state.state1 ().optJson () || {} as any
          const newTicketData: NewTicketData = {
            organisation: 'me',
            name: data.ticketName || "",
            ticket: data.ticketDetails || "",
            ticketType: {} as TicketTypeDetails,
          }
          const ai: AiNewTicketSideEffect = {
            ...newTicketData,
            command: 'aiNewTicket',
          };
          const existing = state.state2 ().optJson () || [];
          state.state2 ().setJson ( [ ...existing, ai ], 'calc variables' );
        }}
      >
        Calc variables
      </Button>

      <Typography>Variables</Typography>


      <DisplayJson json={hackedStateForAi.optJson ()} maxHeight='200px'/>
      {prev}
      {next(true)}
    </Box>
  );
}

export function NotSupportYetTicketDetailsEntry<S> ( { state, prev }: EnterTicketDetailsComp<S> ) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
      <Typography variant="h6" gutterBottom>
        Not Supported Yet
      </Typography>
      <Typography variant="body1" gutterBottom>
        This method is not yet supported.
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', width: '100%', justifyContent: 'start' }}>{prev}</Box>
    </Box>
  );
}
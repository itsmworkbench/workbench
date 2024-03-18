import React from "react";
import { LensProps } from "@focuson/state";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { NewTicketWizardData, TicketSourceAnd } from "./new.ticket.wizard.domain";
import { NextNewWizardStepButton, PreviousNewWizardStepButton } from "./new.ticket.wizard.next.prev";
import { FocusedTextArea, FocusedTextInput, mustBeIdentifier } from "@itsmworkbench/components";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { DisplayJson } from "@itsmworkbench/components/dist/src/displayRaw/display.json";
import { AiNewTicketSideEffect } from "../ai.ticket.sideeffect";
import { NewTicketData } from "../new.ticket.sideeffect";
import { TicketTypeDetails } from "@itsmworkbench/tickettype";
import { useVariables } from "@itsmworkbench/components/src/hooks/useVariables";
import { useSideEffects } from "@itsmworkbench/components";

interface EnterTicketDetailsComp<S> extends LensProps<S, NewTicketWizardData, any> {
  next: ( enabled: boolean ) => React.ReactElement
  prev: React.ReactElement
}


export const enterTicketDetailsComp = <S extends any> (): TicketSourceAnd<React.ComponentType<EnterTicketDetailsComp<S>>> => ({
  manually: ManuallyTicketDetailsEntry<S>,
  fromAzureDevOps: NotSupportYetTicketDetailsEntry<S>,
  fromJira: NotSupportYetTicketDetailsEntry<S>,
  fromServiceNow: NotSupportYetTicketDetailsEntry<S>
})

export function EnterTicketDetails<S> ( { state }: LensProps<S, NewTicketWizardData, any> ) {
  const ticketSource = state.optJson ()?.whereIsTicket;
  if ( ticketSource === undefined ) throw Error ( 'No ticket source' );
  console.log ( 'ticketSource', ticketSource, state );
  const Comp = enterTicketDetailsComp<S> ()[ ticketSource ];
  let stepState = state.focusOn ( 'currentStep' );
  console.log ( 'comp', Comp, enterTicketDetailsComp, stepState )
  if ( Comp === undefined ) throw Error ( 'No component for ticket source ' + ticketSource );
  return <Comp state={state}
               next={enabled => <NextNewWizardStepButton state={stepState} enabled={enabled}/>}
               prev={<PreviousNewWizardStepButton state={stepState}/>}/>
}

export function ManuallyTicketDetailsEntry<S> ( { state, next, prev }: EnterTicketDetailsComp<S> ) {
  const variableState = useVariables<S> ()
  let addSideEffect = useSideEffects ( state );

  return (
    <Box sx={{ '& > *': { mb: 2 } }}> {/* This applies margin-bottom to all immediate children */}

      <Typography variant="h6">New Ticket</Typography>

      <FocusedTextInput
        variant="outlined"
        fullWidth
        label="Ticket Name"
        errorFn={mustBeIdentifier ( 'Can only contain letters, numbers, and underscores' )}
        state={state.focusOn ( 'ticketName' )}
      />
      <FocusedTextArea
        variant="outlined"
        fullWidth
        label="Ticket Contents"
        multiline
        rows={12}
        state={state.focusOn ( 'ticketDetails' )}
      />

      <Button
        variant="contained"
        color="primary"
        endIcon={<SendIcon/>}
        onClick={() => {
          //Just hacking it while experimental
          const data = state.optJson () || {} as any
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
          addSideEffect ( ai )
          // const existing = state.state2 ().optJson () || [];
          // state.state2 ().setJson ( [ ...existing, ai ], 'calc variables' );
        }}
      >
        Calc variables
      </Button>

      <Typography>Variables</Typography>


      <DisplayJson json={variableState.optJson ()} maxHeight='200px'/>
      {prev}
      {next ( true )}
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
import React from "react";
import { LensProps } from "@focuson/state";
import { Box } from "@mui/material";
import Typography from "@mui/material/Typography";
import { NewTicketWizardData, TicketSourceAnd } from "./new.ticket.wizard.domain";
import { NextNewWizardStepButton, PreviousNewWizardStepButton } from "./new.ticket.wizard.next.prev";
import { FocusedTextArea, FocusedTextInput, mustBeIdentifier, useAiVariables, useSideEffects } from "@itsmworkbench/components";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";
import { DisplayJson } from "@itsmworkbench/components";
import { useVariables } from "@itsmworkbench/components";
import { TicketVariables } from "@itsmworkbench/ai_ticketvariables";

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
  const aiFn = useAiVariables ()
  const addSe = useSideEffects ( state )
  const [ ai, setAi ] = React.useState<TicketVariables> ( {} )
  const data = state.optJson () || {} as any
  const se = {
    command: 'addNewTicket',
    organisation: 'me',
    ...data,
    aiAddedVariables: ai
  };
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
        onClick={() => aiFn ( data.ticketDetails ).then ( setAi )}
      >
        Calc variables
      </Button>

      <Typography>Variables</Typography>
      <DisplayJson json={ai} maxHeight='200px'/>
      {prev}
      {next ( true )}
      <Button
        variant="contained"
        color="primary"
        disabled={data?.ticketName === undefined || data?.ticketName.length === 0}
        endIcon={<SendIcon/>}
        onClick={() => addSe ( se )}
      >
        Create or Replace Ticket
      </Button>
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
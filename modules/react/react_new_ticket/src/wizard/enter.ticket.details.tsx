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
  // console.log ( 'ticketSource', ticketSource, state );
  const Comp = enterTicketDetailsComp<S> ()[ ticketSource ];
  let stepState = state.focusOn ( 'currentStep' );
  // console.log ( 'comp', Comp, enterTicketDetailsComp, stepState )
  if ( Comp === undefined ) throw Error ( 'No component for ticket source ' + ticketSource );
  return <Comp state={state}/>
}

export function ManuallyTicketDetailsEntry<S> ( { state }: EnterTicketDetailsComp<S> ) {
  const aiFn = useAiVariables ()
  const [ ai, setAi ] = React.useState<TicketVariables> ( {} )
  const data = state.optJson () || {} as any
  const canNext = data.ticketName && data.ticketName.length > 0 && data.ticketDetails && data.ticketDetails.length > 0
  // console.log ( 'canNext', canNext )
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
      <FocusedTextInput
        variant="outlined"
        fullWidth
        label="Issuer"
        errorFn={mustBeIdentifier ( 'Can only contain letters, numbers, and underscores' )}
        state={state.focusOn ( 'issuer' )}
      />
      <FocusedTextArea
        variant="outlined"
        fullWidth
        label="Ticket Contents"
        multiline
        rows={12}
        state={state.focusOn ( 'ticketDetails' )}
      />
      <PreviousNewWizardStepButton state={state.focusOn ( 'currentStep' )}/>
      <NextNewWizardStepButton enabled={canNext === true} state={state.focusOn ( 'currentStep' )}/>
    </Box>
  );
}

export function NotSupportYetTicketDetailsEntry<S> ( { state }: EnterTicketDetailsComp<S> ) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
      <Typography variant="h6" gutterBottom>
        Not Supported Yet
      </Typography>
      <Typography variant="body1" gutterBottom>
        This method is not yet supported.
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', width: '100%', justifyContent: 'start' }}>
        <PreviousNewWizardStepButton state={state.focusOn ( 'currentStep' )}/>

      </Box>
    </Box>
  );
}
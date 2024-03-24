import { getCurrentStep, NewTicketWizardData } from "./new.ticket.wizard.domain";
import { LensProps, LensState } from "@focuson/state";
import { WizardBreadcrumbs } from "./new.ticket.breadcrumbs";
import React from "react";
import { TicketSourceSelection } from "./ticketSourceSelection";
import { EnterTicketDetails } from "./enter.ticket.details";
import { Box, Container } from "@mui/material";
import { NewHowToProcessTicket } from "./new.how.to.process.ticket";
import { NewSelectKa } from "./new.select.ka";
import { ActionPlugIn, ActionPluginDetails } from "@itsmworkbench/react_core";


export function DisplayNewTicketWizardStep<S> ( { state }: LensProps<S, NewTicketWizardData, any> ) {
  const currentStep = getCurrentStep ( state.focusOn ( 'currentStep' ) );
  let stepAndMethodState = state.doubleUp ().focus1On ( 'currentStep' ).focus2On ( 'whereIsTicket' );
  switch ( currentStep ) {
    case 'whereIsTicket':
      return <TicketSourceSelection state={stepAndMethodState}/>
    case 'createTicket':
      return <EnterTicketDetails state={state}/>
    case 'howToProcessTicket':
      return <NewHowToProcessTicket state={state}/>
    case 'selectKnowledgeArticle':
      return <NewSelectKa state={state}/>
  }
}
export function NewTicketWizard<S> ( { state }: LensProps<S, NewTicketWizardData, any> ) {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <WizardBreadcrumbs state={state.focusOn ( 'currentStep' )}/>
      </Box>
      <Box>
        <DisplayNewTicketWizardStep state={state}/>
      </Box>
    </Container>
  );
}
export const displayNewTicketWizard =
               <S, State> (): ActionPlugIn<S, State, LensProps<S, NewTicketWizardData, any>> =>
                 ( props: ( s: LensState<S, State, any> ) => LensProps<S, NewTicketWizardData, any> ): ActionPluginDetails<S, State, LensProps<S, NewTicketWizardData, any>> =>
                   ({
                     by: "newTicket",
                     props,
                     render: ( s, props ) => <NewTicketWizard {...props} />
                   })
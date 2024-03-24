import { getCurrentStep, NewTicketWizardData } from "./new.ticket.wizard.domain";
import { LensProps, LensProps2, LensState } from "@focuson/state";
import { WizardBreadcrumbs } from "./new.ticket.breadcrumbs";
import React from "react";
import { TicketSourceSelection } from "./ticketSourceSelection";
import { EnterTicketDetails } from "./enter.ticket.details";
import { Box, Container } from "@mui/material";
import { NewHowToProcessTicket } from "./new.how.to.process.ticket";
import { NewSelectKa } from "./new.select.ka";
import { SuccessFailContextFn } from "@itsmworkbench/components/dist/src/buttons/success.failure.button";
import { Action } from "@itsmworkbench/actions";
import { ActionPluginDetails } from "@itsmworkbench/react_core";
import { DisplayLdapWorkbench } from "@itsmworkbench/react_capabilities/dist/src/ldap.workbench";


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
               <S, > ( props: <State, >( s: LensState<State, S, any> ) => LensProps<S, NewTicketWizardData, any> ): ActionPluginDetails<S, LensProps<S, NewTicketWizardData, any>> =>
                 ({
                   by: "newTicket",
                   props,
                   render: ( props ) => <NewTicketWizard {...props} />
                 })
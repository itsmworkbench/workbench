import { LensProps, LensState2, LensState3 } from "@focuson/state";
import { ThemeProvider, Toolbar } from "@mui/material";
import { DisplayMarkdown, MainAppLayout, SilentTabsContainer, SimpleTabPanel, SuccessFailContextFn, SuccessFailureButton, theme } from "@itsmworkbench/components";
import React from "react";
import { ItsmState } from "../state/itsm.state";
import { ConversationPlugin } from "@itsmworkbench/react_conversation";
import { DisplayCapabilitiesMenu, DisplayEmailWorkbench, DisplayKnowledgeArticleWorkbench, DisplayLdapWorkbench, DisplayReceiveEmailWorkbench, DisplaySqlWorkbench, SendTicketForEmailButton } from "@itsmworkbench/react_capabilities";
import { GuiNav } from "./gui.nav";
import { DevMode } from "@itsmworkbench/react_devmode";
import { NewTicketWizard } from "@itsmworkbench/react_new_ticket";
import { DisplayEnrichedEventPlugIn, DisplayEnrichedEvents, DisplayEnrichedEventsUsingPlugin, DisplayEvents, EnrichedEventsAndChat } from "@itsmworkbench/react_events";
import { Capability, PhaseAnd } from "@itsmworkbench/domain";
import { ActionButton, DisplayPhases } from "@itsmworkbench/react_phases";
import { NameAnd } from "@laoban/utils";
import { Action } from "@itsmworkbench/actions";
import { TicketType } from "@itsmworkbench/tickettype";
import { TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { parseNamedUrlOrThrow } from "@itsmworkbench/url";
import { Welcome } from "./welcome";
import { DisplayReviewTicketWorkbench } from "@itsmworkbench/react_capabilities/dist/src/review.ticket.workbench";

export interface AppProps<S, CS> extends LensProps<S, CS, any> {
  plugins: ConversationPlugin<S>[]
  eventPlugins: DisplayEnrichedEventPlugIn<S>[]

}
export function App<S> ( { state, plugins, eventPlugins }: AppProps<S, ItsmState> ) {
  let wholeState = state.optJson ();
  let showDevMode = wholeState?.debug?.showDevMode;
  let showPhases = wholeState?.selectionState?.ticketId !== undefined;
  let showWelcome = wholeState?.selectionState?.tabs?.workspaceTab === undefined;
  console.log ( 'state', wholeState );
  const convState = state.tripleUp ().//
    focus1On ( 'conversation' ).//
    focus2On ( 'events' ).focus2On ( 'enrichedEvents' ).//
    focus3On ( 'sideeffects' )
  const eventsState = state.focusOn ( 'events' )
  const ticketTypeAndSelectionState: LensState2<S, TicketType, TabPhaseAndActionSelectionState, any> = state.doubleUp ().//
    focus1On ( 'blackboard' ).focus1On ( 'ticketType' ).focus1On ( 'ticketType' ).//
    focus2On ( 'selectionState' ).focus2On ( 'tabs' )
  const capabilitiesState: LensState2<S, Capability[], TabPhaseAndActionSelectionState, any> = ticketTypeAndSelectionState.focus1On ( 'capabilities' )
  const phasesState: LensState3<S, PhaseAnd<NameAnd<Action>>, TabPhaseAndActionSelectionState, PhaseAnd<NameAnd<boolean>>, any> =
          state.tripleUp ().//
            focus1On ( 'blackboard' ).focus1On ( 'ticketType' ).focus1On ( 'ticketType' ).focus1On ( 'actions' ).//
            focus2On ( 'selectionState' ).focus2On ( 'tabs' ).//
            focus3On ( 'blackboard' ).focus3On ( 'status' )

  const successFailState = state.doubleUp ().focus1On ( 'sideeffects' ).focus2On ( 'selectionState' ).focus2On ( 'tabs' )
  const pathToStatus = 'blackboard.status'
  const successButton = ( context: SuccessFailContextFn ) => <SuccessFailureButton state={successFailState} successOrFail={true} pathToStatus={pathToStatus} context={context}/>
  const failureButton = ( context: SuccessFailContextFn ) => <SuccessFailureButton state={successFailState} successOrFail={false} pathToStatus={pathToStatus} context={context}/>

  const currentTicketId = wholeState?.selectionState?.ticketId
  const currentUrl = currentTicketId ? parseNamedUrlOrThrow ( currentTicketId ) : undefined
  const currentTicketText = currentTicketId ? ` - ${currentUrl?.name}` : ``

  return <>
    return <ThemeProvider theme={theme}>
    <MainAppLayout title={`ITSM Workbench ${currentTicketText}`}
                   layout={{ leftDrawerWidth: '240px', height: '100vh' }}
                   state={state.focusOn ( "selectionState" ).focusOn ( 'mainScreen' )}
                   Nav={<GuiNav state={state}/>}
                   Details={<DisplayMarkdown md={state.optJson ()?.ticket?.description || state.optJson ()?.tempData?.newTicket?.ticketDetails || '<No Ticket>'}/>}>
      <Toolbar/>
      {showPhases && <DisplayPhases state={phasesState}
                                    Action={( phase, name, action, status ) =>
                                      <ActionButton state={state.tripleUp ().//
                                        focus1On ( 'blackboard' ).focus1On ( 'action' ).//
                                        focus2On ( 'selectionState' ).focus2On ( 'tabs' ).//
                                        focus3On ( 'events' ).focus3On ( 'events' )
                                      } name={name} phase={phase} action={action} status={status}/>}/>}
      {showWelcome && <Welcome count={wholeState?.ticketList?.names?.length}/>}
      <SilentTabsContainer state={state.focusOn ( 'selectionState' ).focusOn ( 'tabs' ).focusOn ( 'workspaceTab' )}>
        <SimpleTabPanel title='chat'>
          <EnrichedEventsAndChat state={convState} plugins={plugins} eventPlugins={eventPlugins} devMode={showDevMode}
                                 plusMenu={<DisplayCapabilitiesMenu state={capabilitiesState}/>}/>
        </SimpleTabPanel>
        <SimpleTabPanel title='events'><DisplayEnrichedEventsUsingPlugin state={eventsState.focusOn ( 'enrichedEvents' )} plugins={eventPlugins}/></SimpleTabPanel>
        <SimpleTabPanel title='debugEvents'><DisplayEvents state={eventsState.focusOn ( 'events' )}/></SimpleTabPanel>
        <SimpleTabPanel title='debugEnrichedEvents'><DisplayEnrichedEvents state={eventsState.focusOn ( 'enrichedEvents' )}/></SimpleTabPanel>
        <SimpleTabPanel title='settings'>
          <div><Toolbar/> Settings go here</div>
        </SimpleTabPanel>
        <SimpleTabPanel title='SQLWorkbench'>
          <DisplaySqlWorkbench state={state.doubleUp ().focus1On ( 'blackboard' ).focus1On ( 'action' )} SuccessButton={successButton} FailureButton={failureButton}/>
        </SimpleTabPanel>
        <SimpleTabPanel title='EmailWorkbench'>
          <DisplayEmailWorkbench state={state.doubleUp ().//
            focus1On ( 'blackboard' ).focus1On ( 'action' ).//
            focus2On ( 'variables' )

          } SuggestButton={<SendTicketForEmailButton state={state.tripleUp ().//
            focus1On ( 'selectionState' ).focus1On ( 'tabs' ).//
            focus2On ( 'ticket' ).//
            focus3On ( 'sideeffects' )}/>} SuccessButton={successButton} FailureButton={failureButton}/>
        </SimpleTabPanel>
        <SimpleTabPanel title='LDAPWorkbench'>
          <DisplayLdapWorkbench state={state.doubleUp ().focus1On ( 'blackboard' ).focus1On ( 'action' )} SuccessButton={successButton} FailureButton={failureButton}/>
        </SimpleTabPanel>

        <SimpleTabPanel title='ReviewTicketWorkbench'>
          <DisplayReviewTicketWorkbench state={state.tripleUp ().//
            focus1On ( 'ticket' ).//
            focus2On ( 'blackboard' ).focus2On ( 'action' ).//
            focus3On ( 'variables' )}
                                        SuccessButton={successButton}
                                        FailureButton={failureButton}
          />
        </SimpleTabPanel>

        <SimpleTabPanel title='ReceiveEmailWorkbench'>
          <DisplayReceiveEmailWorkbench state={state.doubleUp ().focus1On ( 'blackboard' ).focus1On ( 'action' )} SuccessButton={successButton} FailureButton={failureButton}/>
        </SimpleTabPanel>

        <SimpleTabPanel title='KnowledgeArticleWorkbench'>
          <DisplayKnowledgeArticleWorkbench variables={(state.focusOn ( 'blackboard' ).optJson () || {} as any)?.ticket} state={state.tripleUp ().focus1On ( 'tempData' ).focus1On ( 'ka' ).//
            focus2On ( 'events' ).focus2On ( 'events' ).//
            focus3On ( 'sideeffects' )
          } SuccessButton={successButton} FailureButton={failureButton}/>
        </SimpleTabPanel>
        <SimpleTabPanel title='newTicket'>
          <NewTicketWizard
            // kaList={wholeState?.kaList}
            state={state.doubleUp ().focus1On ( 'tempData' ).focus1On ( 'newTicket' ).focus2On ( 'sideeffects' )}/></SimpleTabPanel>
      </SilentTabsContainer>
      {showDevMode && <DevMode maxWidth='95vw' state={state.focusOn ( 'debug' )} titles={[ 'selectionState', 'tempData', 'blackboard', 'events', 'enrichedEvents', "conversation", "variables", "ticket", "templates", 'kas', 'scs', 'log', 'operator' ]}/>}
    </MainAppLayout>
  </ThemeProvider>
  </>
}

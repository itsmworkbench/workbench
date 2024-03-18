import { LensProps, LensState2, LensState3 } from "@focuson/state";
import { ThemeProvider, Toolbar } from "@mui/material";
import {
  DisplayMarkdown, EnrichedEventsProvider, MainAppLayout, SideEffectsProvider,
  VariablesProvider, SilentTabsContainer, SimpleTabPanel, SuccessFailContextFn,
  SuccessFailureButton, theme
} from "@itsmworkbench/components";
import React from "react";
import { actionO, enrichedEventsL, enrichedEventsO, eventsL, eventsO, ItsmState, sideEffectsL, statusL } from "../state/itsm.state";
import { ConversationPlugin } from "@itsmworkbench/react_conversation";
import { DisplayCapabilitiesMenu, DisplayEmailWorkbench, DisplayKnowledgeArticleWorkbench, DisplayLdapWorkbench, DisplayReceiveEmailWorkbench, DisplayReviewTicketWorkbench, DisplaySelectKnowledgeArticleWorkbench, DisplaySqlWorkbench, SendTicketForEmailButton } from "@itsmworkbench/react_capabilities";
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
    chain2 ( enrichedEventsO ).//
    focus3On ( 'sideeffects' )
  const eventsState = state.chainLens ( eventsL )
  const enrichedEventsState = state.chainLens ( enrichedEventsO )
  const ticketTypeAndSelectionState: LensState2<S, TicketType, TabPhaseAndActionSelectionState, any> = state.doubleUp ().//
    focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'ticketType' ).focus1On ( 'item' ).//
    focus2On ( 'selectionState' ).focus2On ( 'tabs' )
  const capabilitiesState: LensState2<S, Capability[], TabPhaseAndActionSelectionState, any> = ticketTypeAndSelectionState.focus1On ( 'capabilities' )
  // const phasesState: LensState3<S, PhaseAnd<NameAnd<Action>>, TabPhaseAndActionSelectionState, PhaseAnd<NameAnd<boolean>>, any> =
  //         state.tripleUp ().//
  //           focus1On ( 'blackboard' ).focus1On ( 'ticketType' ).focus1On ( 'ticketType' ).focus1On ( 'actions' ).//
  //           focus2On ( 'selectionState' ).focus2On ( 'tabs' ).//
  //           chainLens3 ( statusL )
  const pathToStatus = 'forTicket.status'

  const successFailState = state.doubleUp ().focus1On ( 'sideeffects' ).focus2On ( 'selectionState' ).focus2On ( 'tabs' )
  const successButton = ( context: SuccessFailContextFn ) => <SuccessFailureButton state={successFailState} successOrFail={true} pathToStatus={pathToStatus} context={context}/>
  const failureButton = ( context: SuccessFailContextFn ) => <SuccessFailureButton state={successFailState} successOrFail={false} pathToStatus={pathToStatus} context={context}/>

  const currentTicketId = wholeState?.selectionState?.ticketId
  const currentUrl = currentTicketId ? parseNamedUrlOrThrow ( currentTicketId ) : undefined
  const currentTicketText = currentTicketId ? ` - ${currentUrl?.name}` : ``

  return <>
    return <ThemeProvider theme={theme}>
    <SideEffectsProvider sideEffectL={sideEffectsL}>
      <VariablesProvider state={state.focusOn ( 'forTicket' ).focusOn ( 'variables' )}>

        <EnrichedEventsProvider enrichedEvents={enrichedEventsO.getOption ( wholeState || {} as ItsmState )}>
          <MainAppLayout title={`ITSM Workbench ${currentTicketText}`}
                         layout={{ leftDrawerWidth: '240px', height: '100vh' }}
                         state={state.focusOn ( "selectionState" ).focusOn ( 'mainScreen' )}
                         Nav={<GuiNav state={state}/>}
                         Details={<DisplayMarkdown md={state.optJson ()?.forTicket?.ticket?.description || state.optJson ()?.forTicket?.tempData?.newTicket?.ticketDetails || '<No Ticket>'}/>}>
            <Toolbar/>
            {showPhases && <DisplayPhases Action={( phase, name, action, status ) =>
              <ActionButton state={state.doubleUp ().//
                focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'action' ).//
                focus2On ( 'selectionState' ).focus2On ( 'tabs' )}
                            name={name} phase={phase} action={action} status={status}/>}/>}
            {showWelcome && <Welcome count={wholeState?.ticketList?.names?.length}/>}
            <SilentTabsContainer state={state.focusOn ( 'selectionState' ).focusOn ( 'tabs' ).focusOn ( 'workspaceTab' )}>
              <SimpleTabPanel title='chat'>
                <EnrichedEventsAndChat state={convState} plugins={plugins} eventPlugins={eventPlugins} devMode={showDevMode}
                                       plusMenu={<DisplayCapabilitiesMenu state={capabilitiesState}/>}/>
              </SimpleTabPanel>
              <SimpleTabPanel title='events'><DisplayEnrichedEventsUsingPlugin state={eventsState} plugins={eventPlugins}/></SimpleTabPanel>
              <SimpleTabPanel title='debugEvents'><DisplayEvents state={eventsState}/></SimpleTabPanel>
              <SimpleTabPanel title='debugEnrichedEvents'><DisplayEnrichedEvents state={enrichedEventsState}/></SimpleTabPanel>
              <SimpleTabPanel title='settings'>
                <div><Toolbar/> Settings go here</div>
              </SimpleTabPanel>
              <SimpleTabPanel title='SQLWorkbench'>
                <DisplaySqlWorkbench state={state.doubleUp ().chain1 ( actionO )} SuccessButton={successButton} FailureButton={failureButton}/>
              </SimpleTabPanel>
              <SimpleTabPanel title='EmailWorkbench'>
                <DisplayEmailWorkbench state={state.doubleUp ().//
                  focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'action' ).//
                  focus2On ( 'variables' )

                } SuggestButton={<SendTicketForEmailButton state={state.tripleUp ().//
                  focus1On ( 'selectionState' ).focus1On ( 'tabs' ).//
                  focus2On ( 'forTicket' ).focus2On ( 'ticket' ).//
                  focus3On ( 'sideeffects' )}/>} SuccessButton={successButton} FailureButton={failureButton}/>
              </SimpleTabPanel>
              <SimpleTabPanel title='LDAPWorkbench'>
                <DisplayLdapWorkbench state={state.doubleUp ().focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'action' )} SuccessButton={successButton} FailureButton={failureButton}/>
              </SimpleTabPanel>

              <SimpleTabPanel title='ReviewTicketWorkbench'>
                <DisplayReviewTicketWorkbench state={state.tripleUp ().//
                  focus1On ( 'forTicket' ).focus1On ( 'ticket' ).//
                  chain2 ( actionO ).//
                  focus3On ( 'forTicket' ).focus3On ( 'tempData' ).focus3On ( 'ticketType' ).focus3On ( 'item' )}
                                              SuccessButton={successButton}
                                              FailureButton={failureButton}
                />
              </SimpleTabPanel>

              <SimpleTabPanel title='ReceiveEmailWorkbench'>
                <DisplayReceiveEmailWorkbench state={state.doubleUp ().chain1 ( actionO )} SuccessButton={successButton} FailureButton={failureButton}/>
              </SimpleTabPanel>

              <SimpleTabPanel title='CreateKnowledgeArticleWorkbench'>
                <DisplayKnowledgeArticleWorkbench variables={(state.//
                  focusOn ( 'forTicket' ).focusOn ( 'variables' ).optJson () || {} as any)?.ticket}
                                                  state={state.tripleUp ().//
                                                    focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'ka' ).//
                                                    chain2 ( eventsO ).//
                                                    focus3On ( 'sideeffects' )
                                                  } SuccessButton={successButton} FailureButton={failureButton}/>
              </SimpleTabPanel>
              <SimpleTabPanel title='SelectKnowledgeArticleWorkbench'>
                <DisplaySelectKnowledgeArticleWorkbench
                  targetPath='forTicket.tempData.newTicket.ticketDetails'
                  state={state.doubleUp ().//
                    chain1 ( actionO ).//
                    focus2On ( 'forTicket' ).focus2On ( 'tempData' ).focus2On ( 'ticketType' )//
                  }
                  SuccessButton={successButton} FailureButton={failureButton}/>
              </SimpleTabPanel>
              <SimpleTabPanel title='newTicket'>
                <NewTicketWizard state={state.focusOn ( 'forTicket' ).focusOn ( 'tempData' ).focusOn ( 'newTicket' )}/></SimpleTabPanel>
            </SilentTabsContainer>
            {showDevMode && <DevMode maxWidth='95vw' state={state.focusOn ( 'debug' )}
                                     titles={[ 'selectionState', 'log' ]}
                                     forTicket={[ 'events', 'enrichedEvents', 'ticket', 'variables', 'status', 'tempData' ]}
                                     tempData={[ 'newTicket', 'action' ]}/>}
          </MainAppLayout></EnrichedEventsProvider>
      </VariablesProvider>
    </SideEffectsProvider>
  </ThemeProvider>
  </>
}

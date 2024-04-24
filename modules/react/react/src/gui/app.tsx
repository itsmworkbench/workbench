import { LensProps } from "@focuson/state";
import { ThemeProvider, Toolbar } from "@mui/material";
import { EnrichedEventsProvider, MainAppLayout, SelectionProvider, SideEffectsProvider, StatusProvider, theme } from "@itsmworkbench/components";
import React from "react";
import { enrichedEventsO, ItsmState, sideEffectsL } from "../state/itsm.state";
import { ConversationPlugin } from "@itsmworkbench/react_conversation";
import { GuiNav } from "./gui.nav";
import { DevMode } from "@itsmworkbench/react_devmode";

import { DisplayEnrichedEventPlugIn } from "@itsmworkbench/reactevents";
import { ActionButton, DisplayPhases } from "@itsmworkbench/reacttickettype";
import { ActionPluginDetails, displayActionPlugin } from "@itsmworkbench/react_core";
import { parseNamedUrlOrThrow } from "@itsmworkbench/urlstore";
import { Welcome } from "./welcome";
import { DisplayInfoPanel } from "@itsmworkbench/react_displayinfo";
import { Optional } from "@focuson/lens";

export interface AppProps<S, CS> extends LensProps<S, CS, any> {
  plugins: ConversationPlugin<S>[]
  actionPlugins: ActionPluginDetails<S, CS, any>[]
  byO: Optional<CS, string>,
  eventPlugins: DisplayEnrichedEventPlugIn<S>[]
}


export function App<S> ( { state, plugins, actionPlugins, eventPlugins, byO }: AppProps<S, ItsmState> ) {
  let wholeState = state.optJson ();
  let showDevMode = wholeState?.debug?.showDevMode;
  let showPhases = wholeState?.selectionState?.ticketId !== undefined;
  let showWelcome = wholeState?.selectionState?.tabs?.workspaceTab === undefined;

  const currentTicketId = wholeState?.selectionState?.ticketId
  const ticket = wholeState?.forTicket?.ticket
  const currentUrl = currentTicketId ? parseNamedUrlOrThrow ( currentTicketId ) : undefined
  const currentTicketText = currentTicketId ? ` - ${currentUrl?.name}` : ``

  let enrichedEvents = enrichedEventsO.getOption ( wholeState || {} as ItsmState ) || [];
  // console.log ( 'app - enrichedEvents', enrichedEvents )
  return <>
    return <ThemeProvider theme={theme}>
    <SelectionProvider state={state.focusOn ( 'selectionState' ).focusOn ( 'tabs' )}>
      <SideEffectsProvider sideEffectL={sideEffectsL}>
        <StatusProvider status={wholeState?.forTicket?.status || {} as any}>
          <EnrichedEventsProvider enrichedEvents={enrichedEvents}>
            <MainAppLayout title={`ITSM Workbench ${currentTicketText}`}
                           layout={{ leftDrawerWidth: '240px', height: '100vh' }}
                           state={state.focusOn ( "selectionState" ).focusOn ( 'mainScreen' )}
                           Nav={<GuiNav state={state}/>}
                           Details={<DisplayInfoPanel state={state.doubleUp ().focus1On ( 'forTicket' ).focus1On ( 'ticket' ).//
                             focus2On ( 'forTicket' ).focus2On ( 'tempData' ).focus2On ( 'newTicket' )}/>}>
              <Toolbar/>
              {showPhases && <DisplayPhases Action={( phase, name, action, status ) =>
                <ActionButton state={state.doubleUp ().//
                  focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'action' ).//
                  focus2On ( 'selectionState' ).focus2On ( 'tabs' )}
                              name={name} phase={phase} action={action} status={status} ticket={ticket}/>}/>}

              {displayActionPlugin ( actionPlugins, () => undefined, byO ) ( state )}

              {showWelcome && <Welcome count={wholeState?.ticketList?.names?.length}/>}

              {showDevMode && <DevMode maxWidth='95vw' state={state.focusOn ( 'debug' )}
                                       titles={[ 'selectionState', 'depDataLog', 'tags', 'log', 'basicData' ]}
                                       forTicket={[ 'events', 'enrichedEvents', 'ticket', 'variables', 'status', 'tempData' ]}
                                       tempData={[ 'newTicket', 'action' ]}/>}
            </MainAppLayout></EnrichedEventsProvider></StatusProvider>
      </SideEffectsProvider>
    </SelectionProvider>
  </ThemeProvider>
  </>
}


//export function MainBody<S> ( { state, plugins, eventPlugins }: AppProps<S, ItsmState> ) {
//   let wholeState = state.optJson ();
//   let showDevMode = wholeState?.debug?.showDevMode;
//   const convState = state.tripleUp ().//
//     focus1On ( 'conversation' ).//
//     chain2 ( enrichedEventsO ).//
//     focus3On ( 'sideeffects' )
//   const eventsState = state.chainLens ( eventsL )
//   const enrichedEventsState = state.chainLens ( enrichedEventsO )
//   const ticketTypeAndSelectionState: LensState2<S, TicketType, TabPhaseAndActionSelectionState, any> = state.doubleUp ().//
//     focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'ticketType' ).focus1On ( 'item' ).//
//     focus2On ( 'selectionState' ).focus2On ( 'tabs' )
//   const capabilitiesState: LensState2<S, Capability[], TabPhaseAndActionSelectionState, any> = ticketTypeAndSelectionState.focus1On ( 'capabilities' )
//
//   let enrichedEvents = enrichedEventsO.getOption ( wholeState || {} as ItsmState ) || [];
//   return <SilentTabsContainer state={state.focusOn ( 'selectionState' ).focusOn ( 'tabs' ).focusOn ( 'workspaceTab' )}>
//     <SimpleTabPanel title='chat'>
//       <EnrichedEventsAndChat state={convState} plugins={plugins} eventPlugins={eventPlugins} devMode={showDevMode}
//                              plusMenu={<DisplayCapabilitiesMenu state={capabilitiesState}/>}/>
//     </SimpleTabPanel>
//     <SimpleTabPanel title='events'><DisplayEnrichedEventsUsingPlugin state={eventsState} plugins={eventPlugins}/></SimpleTabPanel>
//     <SimpleTabPanel title='debugEvents'><DisplayEvents state={eventsState}/></SimpleTabPanel>
//     <SimpleTabPanel title='debugEnrichedEvents'><DisplayEnrichedEvents state={enrichedEventsState}/></SimpleTabPanel>
//     <SimpleTabPanel title='settings'>
//       <div><Toolbar/> Settings go here</div>
//     </SimpleTabPanel>
//     <SimpleTabPanel title='SQLWorkbench'>
//       <DisplaySqlWorkbench state={state.chainLens ( actionO )}/>
//     </SimpleTabPanel>
//     <SimpleTabPanel title='EmailWorkbench'>
//       <DisplayEmailWorkbench state={state.chainLens ( actionO )} SuggestButton={
//         <SuggestEmailForTicketButton state={state.tripleUp ().//
//           focus1On ( 'selectionState' ).focus1On ( 'tabs' ).//
//           focus2On ( 'forTicket' ).focus2On ( 'ticket' ).//
//           focus3On ( 'forTicket' ).focus3On ( 'tempData' ).focus3On ( 'action' )}/>}/>
//     </SimpleTabPanel>
//     <SimpleTabPanel title='LDAPWorkbench'>
//       <DisplayLdapWorkbench state={state.doubleUp ().focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'action' )}/>
//     </SimpleTabPanel>
//
//     <SimpleTabPanel title='ReviewTicketWorkbench'>
//       <DisplayReviewTicketWorkbench state={state.doubleUp ().//
//         focus1On ( 'forTicket' ).focus1On ( 'ticket' ).//
//         chain2 ( actionO )}
//       />
//     </SimpleTabPanel>
//
//     <SimpleTabPanel title='ReceiveEmailWorkbench'>
//       <DisplayReceiveEmailWorkbench state={state.doubleUp ().chain1 ( actionO )}/>
//     </SimpleTabPanel>
//     <SimpleTabPanel title='debugVariables'>
//       <DisplayVariables/>
//     </SimpleTabPanel>
//
//     <SimpleTabPanel title='CreateKnowledgeArticleWorkbench'>
//       <DisplayKnowledgeArticleWorkbench
//         state={state.tripleUp ().//
//           focus1On ( 'forTicket' ).focus1On ( 'tempData' ).focus1On ( 'ka' ).//
//           chain2 ( eventsO ).//
//           focus3On ( 'sideeffects' )
//         }/>
//     </SimpleTabPanel>
//     <SimpleTabPanel title='SelectKnowledgeArticleWorkbench'>
//       <DisplaySelectKnowledgeArticleWorkbench
//         targetPath='forTicket.tempData.newTicket.ticketDetails'
//         state={state.doubleUp ().//
//           chain1 ( actionO ).//
//           focus2On ( 'forTicket' ).focus2On ( 'tempData' ).focus2On ( 'ticketType' )//
//         }
//       />
//     </SimpleTabPanel>
//     <SimpleTabPanel title='newTicket'>
//       <NewTicketWizard state={state.focusOn ( 'forTicket' ).focusOn ( 'tempData' ).focusOn ( 'newTicket' )}/></SimpleTabPanel>
//   </SilentTabsContainer>
// }
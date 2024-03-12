import { LensProps, LensState2 } from "@focuson/state";
import { ThemeProvider, Toolbar } from "@mui/material";
import { ColumnLeftMainBottom, SilentTabsContainer, SimpleTabPanel, theme } from "@itsmworkbench/components";
import React from "react";
import { ItsmState } from "../state/itsm.state";
import { ConversationPlugin } from "@itsmworkbench/react_conversation";
import { DisplayCapabilitiesMenu, DisplaySqlWorkbench } from "@itsmworkbench/react_capabilities";
import { GuiNav } from "./gui.nav";
import { DevMode } from "@itsmworkbench/react_devmode";
import { DisplayNewTicket } from "@itsmworkbench/react_new_ticket";
import { DisplayEnrichedEventPlugIn, DisplayEnrichedEvents, DisplayEnrichedEventsUsingPlugin, DisplayEvents, EnrichedEventsAndChat } from "@itsmworkbench/react_events";
import { Capability, PhaseAnd } from "@itsmworkbench/domain";
import { DisplayPhases } from "@itsmworkbench/react_phases";
import { NameAnd } from "@laoban/utils";
import { Action } from "@itsmworkbench/actions";
import { TicketType } from "@itsmworkbench/tickettype";
import { TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";

export interface AppProps<S, CS> extends LensProps<S, CS, any> {
  plugins: ConversationPlugin<S>[]
  eventPlugins: DisplayEnrichedEventPlugIn<S>[]
}

export function App<S> ( { state, plugins, eventPlugins }: AppProps<S, ItsmState> ) {
  let showDevMode = state.optJson ()?.debug?.showDevMode;
  console.log ( 'state', state.optJson () );
  const convState = state.tripleUp ().focus1On ( 'conversation' ).focus2On ( 'events' ).focus2On ( 'enrichedEvents' ).focus3On ( 'sideeffects' )
  const eventsState = state.focusOn ( 'events' )
  const ticketTypeAndSelectionState: LensState2<S, TicketType, TabPhaseAndActionSelectionState, any> = state.doubleUp ().//
    focus1On ( 'blackboard' ).focus1On ( 'ticketType' ).focus1On ( 'ticketType' ).//
    focus2On ( 'selectionState' ).focus2On ( 'tabs' )
  const capabilitiesState: LensState2<S, Capability[], TabPhaseAndActionSelectionState, any> = ticketTypeAndSelectionState.focus1On ( 'capabilities' )
  const phasesState: LensState2<S, PhaseAnd<NameAnd<Action>>, TabPhaseAndActionSelectionState, any> = ticketTypeAndSelectionState.focus1On ( 'actions' )

  return <>
    return <ThemeProvider theme={theme}>
    <ColumnLeftMainBottom title='ITSM Workbench'
                          layout={{ drawerWidth: '240px', height: '100vh' }}
                          state={state.focusOn ( "selectionState" ).focusOn ( 'mainScreen' )}
                          Nav={<GuiNav state={state}/>}>
      <Toolbar/>
      <DisplayPhases state={phasesState}/>
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
        <SimpleTabPanel title='SQLWorkbench'><DisplaySqlWorkbench state={state.doubleUp ().focus1On ( 'tempData' ).focus1On ( 'sqlData' )}/></SimpleTabPanel>
        <SimpleTabPanel title='newTicket'><DisplayNewTicket state={state.doubleUp ().focus1On ( 'tempData' ).focus1On ( 'newTicket' ).focus2On ( 'sideeffects' )}/></SimpleTabPanel>
      </SilentTabsContainer>
      {showDevMode && <DevMode maxWidth='95vw' state={state.focusOn ( 'debug' )} titles={[ 'selectionState', 'tempData', 'blackboard', 'events', 'enrichedEvents', "conversation", "variables", "ticket", "templates", 'kas', 'scs', 'log', 'operator' ]}/>}
    </ColumnLeftMainBottom>
  </ThemeProvider>
  </>
}

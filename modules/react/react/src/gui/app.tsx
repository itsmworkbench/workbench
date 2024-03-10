import { LensProps } from "@focuson/state";
import { ThemeProvider, Toolbar } from "@mui/material";
import { ColumnLeftMainBottom, SilentTabsContainer, SimpleTabPanel, theme } from "@itsmworkbench/components";
import React from "react";
import { ItsmState } from "../state/itsm.state";
import { ConversationPlugin } from "@itsmworkbench/react_conversation";
import { GuiNav } from "./gui.nav";
import { DevMode } from "@itsmworkbench/react_devmode";
import { DisplayNewTicket } from "@itsmworkbench/react_new_ticket";
import { DisplayEnrichedEventPlugIn, DisplayEnrichedEvents, DisplayEnrichedEventsUsingPlugin, DisplayEvents, EnrichedEventsAndChat } from "@itsmworkbench/react_events";

export interface AppProps<S, CS> extends LensProps<S, CS, any> {
  plugins: ConversationPlugin<S>[]
  eventPlugins: DisplayEnrichedEventPlugIn<S>[]
}

export function App<S> ( { state, plugins, eventPlugins }: AppProps<S, ItsmState> ) {
  let showDevMode = state.optJson ()?.debug?.showDevMode;
  console.log ( 'state', state.optJson () );
  const convState = state.tripleUp ().focus1On ( 'conversation' ).focus2On('events').focus2On ( 'enrichedEvents' ).focus3On ( 'sideeffects' )
  const eventsState = state.focusOn ( 'events' )
  return <>
    return <ThemeProvider theme={theme}>
    <ColumnLeftMainBottom title='ITSM Workbench'
                          layout={{ drawerWidth: '240px', height: '100vh' }}
                          state={state.focusOn ( "selectionState" ).focusOn ( 'mainScreen' )}
                          Nav={<GuiNav state={state}/>}>
      <Toolbar/>
      <SilentTabsContainer state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )}>
        <SimpleTabPanel title='chat'><EnrichedEventsAndChat state={convState} plugins={plugins} eventPlugins={eventPlugins}/></SimpleTabPanel>
        <SimpleTabPanel title='events'><DisplayEnrichedEventsUsingPlugin state={eventsState.focusOn ( 'enrichedEvents' )} plugins={eventPlugins}/></SimpleTabPanel>
        <SimpleTabPanel title='debugEvents'><DisplayEvents state={eventsState.focusOn ( 'events' )}/></SimpleTabPanel>
        <SimpleTabPanel title='debugEnrichedEvents'><DisplayEnrichedEvents state={eventsState.focusOn ( 'enrichedEvents' )}/></SimpleTabPanel>
        <SimpleTabPanel title='settings'>
          <div><Toolbar/> Settings go here</div>
        </SimpleTabPanel>
        <SimpleTabPanel title='newTicket'><DisplayNewTicket state={state.doubleUp ().focus1On ( 'tempData' ).focus1On ( 'newTicket' ).focus2On ( 'sideeffects' )}/></SimpleTabPanel>
      </SilentTabsContainer>

      {showDevMode && <DevMode maxWidth='95vw' state={state.focusOn ( 'debug' )} titles={[ 'selectionState', 'events', 'enrichedEvents', "conversation", "variables", "ticket", "templates", 'kas', 'scs', 'log', 'operator' ]}/>}
    </ColumnLeftMainBottom>
  </ThemeProvider>
  </>
}

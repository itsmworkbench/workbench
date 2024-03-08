import { LensProps } from "@focuson/state";
import { ThemeProvider, Toolbar } from "@mui/material";
import { ColumnLeftMainBottom, SilentTabsContainer, SimpleTabPanel, theme } from "@itsmworkbench/components";
import React from "react";
import { ItsmState } from "../state/itsm.state";
import { ConversationHistoryAndChat, ConversationPlugin } from "@itsmworkbench/react_conversation";
import { GuiNav } from "./gui.nav";
import { DevMode } from "@itsmworkbench/react_devmode";
import { DisplayNewTicket } from "@itsmworkbench/react_new_ticket";

export interface AppProps<S, CS> extends LensProps<S, CS, any> {
  plugins: ConversationPlugin<S>[]
}

export function App<S> ( { state, plugins }: AppProps<S, ItsmState> ) {
  let showDevMode = state.optJson ()?.debug?.showDevMode;
  console.log ( 'state', state.optJson () );
  const convState = state.doubleUp ().focus1On ( 'conversation' ).focus2On ( 'sideeffects' )
  return <>
    return <ThemeProvider theme={theme}>
    <ColumnLeftMainBottom title='ITSM Workbench'
                          layout={{ drawerWidth: '240px', height: '100vh' }}
                          state={state.focusOn ( "selectionState" ).focusOn ( 'mainScreen' )}
                          Nav={<GuiNav state={state}/>}>
      <Toolbar/>
      <SilentTabsContainer state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )}>
        <SimpleTabPanel title='chat'><ConversationHistoryAndChat state={convState} plugins={plugins}/></SimpleTabPanel>
        <SimpleTabPanel title='settings'>
          <div><Toolbar/> Settings go here</div>
        </SimpleTabPanel>
        <SimpleTabPanel title='newTicket'><DisplayNewTicket state={state.doubleUp ().focus1On ( 'newTicket' ).focus2On ( 'sideeffects' )}/></SimpleTabPanel>
      </SilentTabsContainer>

      {showDevMode && <DevMode maxWidth='95vw' state={state.focusOn ( 'debug' )} titles={[ 'selectionState', "conversation", "variables", "tickets", "templates", 'kas', 'scs', 'log', 'operator' ]}/>}
    </ColumnLeftMainBottom>
  </ThemeProvider>
  </>
}

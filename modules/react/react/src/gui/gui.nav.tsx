import { LensProps, LensState2 } from "@focuson/state";
import { ItsmState } from "../state/itsm.state";
import { FocusOnSetValueButton, FocusOnToggleButton } from "@itsmworkbench/components";
import { DisplayTicketList } from "@itsmworkbench/react_ticket";
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import SettingsIcon from '@mui/icons-material/Settings';
import React from "react";
import { Box } from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';

export function GuiNav<S> ( { state }: LensProps<S, ItsmState, any> ) {
  const buttonSx = {
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
  };
  // @ts-ignore
  let displayTicketState: LensState2<S, string[], string | undefined, any> = state.doubleUp ().focus1On ( 'ticketList' ).focus1On ( 'names' )
    .focus2On ( 'ticket' ).focus2On ( 'id' );
  return <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2, // Adjust the gap size to your preference
      p: 1, // Adds padding around the entire container
    }}
  >
    <FocusOnSetValueButton aria-label='Chat' startIcon={<ChatIcon/>} valueToSet='chat' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>Chat</FocusOnSetValueButton>
    <FocusOnSetValueButton aria-label='Show settings' startIcon={<SettingsIcon/>} valueToSet='settings' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>Settings</FocusOnSetValueButton>
    <FocusOnSetValueButton aria-label='New ticket' startIcon={<AddIcon/>} valueToSet='newTicket' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>New Ticket</FocusOnSetValueButton>
    <DisplayTicketList state={displayTicketState}/>
    <FocusOnToggleButton aria-label='Toggle Developer Mode' startIcon={<DeveloperModeIcon/>} state={state.focusOn ( 'debug' ).focusOn ( 'showDevMode' )} sx={buttonSx}>Developer Mode</FocusOnToggleButton>
  </Box>
}
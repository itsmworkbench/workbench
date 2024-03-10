import { LensProps, LensState3 } from "@focuson/state";
import { ItsmState } from "../state/itsm.state";
import { FocusOnSetValueButton, FocusOnToggleButton } from "@itsmworkbench/components";
import { DisplayTicketList } from "@itsmworkbench/react_ticket";
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import SettingsIcon from '@mui/icons-material/Settings';
import React from "react";
import { Box } from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import { Event } from '@itsmworkbench/events';

export function GuiNav<S> ( { state }: LensProps<S, ItsmState, any> ) {
  const buttonSx = {
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
  };

  let displayTicketState: LensState3<S, string[], string, Event[], any> = state.tripleUp ().//
    focus1On ( 'ticketList' ).focus1On ( 'names' ).//
    focus2On ( 'selectionState' ).focus2On ( 'ticketId' ).//
    focus3On ( 'events' );
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
    <FocusOnSetValueButton aria-label='Debug Events' startIcon={<EventIcon/>} valueToSet='events' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>Debug Events</FocusOnSetValueButton>
  </Box>
}
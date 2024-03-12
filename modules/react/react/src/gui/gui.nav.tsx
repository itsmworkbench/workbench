import { LensProps, LensState3 } from "@focuson/state";
import { ItsmSelectionState, ItsmState } from "../state/itsm.state";
import { FocusOnSetValueButton, FocusOnToggleButton } from "@itsmworkbench/components";
import { DisplayTicketList } from "@itsmworkbench/react_ticket";
import { DisplayCapabilitiesList } from "@itsmworkbench/react_capabilities";
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import SettingsIcon from '@mui/icons-material/Settings';
import React from "react";
import { Box } from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import { EventsAndEnriched } from "@itsmworkbench/react_core";

export function GuiNav<S> ( { state }: LensProps<S, ItsmState, any> ) {
  const buttonSx = {
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
  };

  let displayTicketState: LensState3<S, string[], ItsmSelectionState, EventsAndEnriched, any> = state.tripleUp ().//
    focus1On ( 'ticketList' ).focus1On ( 'names' ).//
    focus2On ( 'selectionState' ).//
    focus3On ( 'events' );
  let capabilitiesState: LensState2<S, Capabilities[], string, any> = state.doubleUp ().//
    focus1On ( 'blackboard' ).focus1On ( 'ticketType' ).focus1On ( 'ticketType' ).focus1On ( 'capabilities' ).//
    focus2On ( 'selectionState' ).focus2On ( 'workspaceTab' )
  const showDevMode = state.optJson ()?.debug?.showDevMode;
  return <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2, // Adjust the gap size to your preference
      p: 1, // Adds padding around the entire container
    }}
  >
    <FocusOnSetValueButton aria-label='Chat' startIcon={<ChatIcon/>} valueToSet='chat' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>Chat</FocusOnSetValueButton>
    <FocusOnSetValueButton aria-label='New ticket' startIcon={<AddIcon/>} valueToSet='newTicket' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>New Ticket</FocusOnSetValueButton>
    <DisplayTicketList state={displayTicketState}/>
    <FocusOnSetValueButton aria-label='Show settings' startIcon={<SettingsIcon/>} valueToSet='settings' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>Settings</FocusOnSetValueButton>
    <FocusOnToggleButton aria-label='Toggle Developer Mode' startIcon={<DeveloperModeIcon/>} state={state.focusOn ( 'debug' ).focusOn ( 'showDevMode' )} sx={buttonSx}>Developer Mode</FocusOnToggleButton>
    {showDevMode && <>
           <FocusOnSetValueButton aria-label='Debug Events' startIcon={<EventIcon/>} valueToSet='debugEvents' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>Debug Events</FocusOnSetValueButton>
        <FocusOnSetValueButton aria-label='Debug Enriched Events' startIcon={<EventIcon/>} valueToSet='debugEnrichedEvents' state={state.focusOn ( 'selectionState' ).focusOn ( 'workspaceTab' )} sx={buttonSx}>Debug Enriched Events</FocusOnSetValueButton>
    </>}
  </Box>
}
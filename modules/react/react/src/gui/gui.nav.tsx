import { LensProps, LensState3 } from "@focuson/state";
import { ItsmSelectionState, ItsmState, ItsmStateDataForTicket } from "../state/itsm.state";
import { FocusOnSetValueButton, FocusOnToggleButton } from "@itsmworkbench/components";
import { DisplayTicketList } from "@itsmworkbench/react_ticket";
import DeveloperModeIcon from '@mui/icons-material/DeveloperMode';
import SettingsIcon from '@mui/icons-material/Settings';
import React from "react";
import { Box } from "@mui/material";
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import { NewTicketButton } from "@itsmworkbench/react_new_ticket";

export function GuiNav<S> ( { state }: LensProps<S, ItsmState, any> ) {
  const buttonSx = {
    justifyContent: 'flex-start',
    textAlign: 'left',
    width: '100%',
  };

  let displayTicketState: LensState3<S, string[], ItsmSelectionState, ItsmStateDataForTicket, any> = state.tripleUp ().//
    focus1On ( 'ticketList' ).focus1On ( 'names' ).//
    focus2On ( 'selectionState' ).//
    focus3On ( 'forTicket' );

  const showDevMode = state.optJson ()?.debug?.showDevMode;

  let tabsState = state.focusOn ( 'selectionState' ).focusOn ( 'tabs' );
  return <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2, // Adjust the gap size to your preference
      p: 1, // Adds padding around the entire container
    }}
  >
    <NewTicketButton aria-label='New ticket' startIcon={<AddIcon/>} state={state.focusOn ( 'selectionState' )} sx={buttonSx}>New Ticket</NewTicketButton>
    <DisplayTicketList state={displayTicketState}/>
    <FocusOnSetValueButton aria-label='Show settings' startIcon={<SettingsIcon/>} valueToSet={{ workspaceTab: 'settings' }} state={tabsState} sx={buttonSx}>Settings</FocusOnSetValueButton>
    <FocusOnToggleButton aria-label='Toggle Developer Mode' startIcon={<DeveloperModeIcon/>} state={state.focusOn ( 'debug' ).focusOn ( 'showDevMode' )} sx={buttonSx}>Developer Mode</FocusOnToggleButton>
    {showDevMode && <>
        <FocusOnSetValueButton aria-label='Debug Variables' valueToSet={{ workspaceTab: 'debugVariables' }} state={tabsState} sx={buttonSx}>Debug Variables</FocusOnSetValueButton>
        <FocusOnSetValueButton aria-label='Debug Events' startIcon={<EventIcon/>} valueToSet={{ workspaceTab: 'debugEvents' }} state={tabsState} sx={buttonSx}>Debug Events</FocusOnSetValueButton>
        <FocusOnSetValueButton aria-label='Debug Enriched Events' startIcon={<EventIcon/>} valueToSet={{ workspaceTab: 'debugEnrichedEvents' }} state={tabsState} sx={buttonSx}>Debug Enriched Events</FocusOnSetValueButton>
        <FocusOnSetValueButton aria-label='Chat' startIcon={<ChatIcon/>} valueToSet={{ workspaceTab: 'chat' }} state={tabsState} sx={buttonSx}>Chat</FocusOnSetValueButton>
    </>}
  </Box>
}
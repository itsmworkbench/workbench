import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { SetValueEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { MicroCard, PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro, DisplayEnrichedEventPlugIn, DisplayEnrichedEventProps } from "@itsmworkbench/react_events";

import { Box, Card, CardContent, CardHeader } from "@mui/material";
import { SelectTicketType } from "./select.ticket.type";


export interface DisplayTicketEventMiniProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<SetValueEvent, any>, any>> {
}

export function DisplayTicketTypeEventFull<S> ( { state, icons }: DisplayTicketEventMiniProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  const title = event.displayData?.title || event.event
  const name = event.context?.display?.name
  const titleAndName = name ? `${title} - ${name}` : title
  return <Card sx={{ width: '100%', maxWidth: '75vw' }}>
    {/* CardHeader for actions */}
    <CardHeader
      action={<Box display="flex" alignItems="center">{icons}</Box>}
      title={<SelectTicketType state={state.focusOn ( 'value' )} readonly={true}/>}
      sx={{ position: 'relative', '.MuiCardHeader-action': { margin: 0, alignSelf: 'flex-start' } }}
    />
  </Card>
}
export function DisplayTicketTypeMicro<S> ( { state, icons }: DisplayTicketEventMiniProps<S> ) {
  function getSummary () {
    const event = state.optJson ()
    if ( event === undefined ) return 'No event - This is an error'
    const title = event.displayData?.title || event.event
    const { ticketType, approvalState, validateInvolvedParties } = event.value
    const titleAndName = `Ticket type: ${ticketType} - ${approvalState} ${validateInvolvedParties ? ' - validate involved parties in LDAP' : ''}`
    return titleAndName;
  }
  return <div><MicroCard icons={icons} summary={getSummary ()}/></div>
}

export function displayTicketTypeEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'setValue' && event.displayData?.type === 'ticketType',
    microDisplay: DisplayTicketTypeMicro,
    fullDisplay: DisplayTicketTypeEventFull
  };
}
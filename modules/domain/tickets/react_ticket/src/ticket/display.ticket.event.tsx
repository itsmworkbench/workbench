import { EnrichedEvent, SetIdEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro, DisplayEnrichedEventPlugIn } from "@itsmworkbench/reactevents";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";


export interface DisplayTicketEventMiniProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<SetIdEvent, any>, any>> {
}

export function DisplayTicketEventFull<S> ( { state, icons }: DisplayTicketEventMiniProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  const title = event.displayData?.title || event.event
  const name = event.context?.display?.name
  const titleAndName = name ? `${title} - ${name}` : title
  const description = event.displayData?.value?.result?.description || '<Error: no description>'
  return <Card sx={{ width: '100%', maxWidth: '75vw' }}>
    {/* CardHeader for actions */}
    <CardHeader
      action={<Box display="flex" alignItems="center">{icons}</Box>}
      title={titleAndName}
      sx={{ position: 'relative', '.MuiCardHeader-action': { margin: 0, alignSelf: 'flex-start' } }}
    />
    <CardContent>
      <Typography variant="body1" component="pre">
        {description}
      </Typography>
    </CardContent>
  </Card>
}


export function displayTicketEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'setId' && event.displayData?.type === 'ticket',
    microDisplay: DisplayDefaultEnrichedEventMicro,
    fullDisplay: DisplayTicketEventFull
  };
}
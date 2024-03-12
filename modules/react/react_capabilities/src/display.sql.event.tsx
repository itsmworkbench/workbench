import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { SetValueEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro, DisplayEnrichedEventPlugIn } from "@itsmworkbench/react_events";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";


export interface DisplaySqlEventProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<SetValueEvent, any>, any>> {
}

export function DisplaySqlEventFull<S> ( { state, icons }: DisplaySqlEventProps<S> ) {
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


export function displaySqlEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'setId' && event.displayData?.type === 'ticket',
    microDisplay: DisplayDefaultEnrichedEventMicro,
    fullDisplay: DisplaySqlEventFull
  };
}
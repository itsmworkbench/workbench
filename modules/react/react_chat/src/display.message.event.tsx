import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { AppendEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { MicroCard, PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayEnrichedEventPlugIn, DisplayEnrichedEventProps } from "@itsmworkbench/react_events";
import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material';


export interface DisplayMessageEventMiniProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<AppendEvent, any>, any>> {
}

export function DisplayDefaultEnrichedMessageEventFull<S> ( { state, icons }: DisplayMessageEventMiniProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  const title = event.displayData?.title || event.event
  const who = event.value?.who || '<Error: no who>'
  const titleAndName = who ? `${title} - From ${who}` : title
  const message = event.value?.message || '<Error: no message>'
  return <Card sx={{ width: '100%', maxWidth: '75vw' }}>
    {/* CardHeader for actions */}
    <CardHeader
      action={<Box display="flex" alignItems="center">{icons}</Box>}
      title={titleAndName}
      sx={{ position: 'relative', '.MuiCardHeader-action': { margin: 0, alignSelf: 'flex-start' } }}
    />
    <CardContent>
      <Typography variant="body1" component="pre">
        {message}
      </Typography>
    </CardContent>
  </Card>
}
export function DisplayDefaultEnrichedMessageEventMicro<S> ( { state, icons }: DisplayEnrichedEventProps<S> ) {
  function getSummary () {
    const event = state.optJson ()
    if ( event === undefined ) return 'No event - This is an error'
    const title = event.displayData?.title || event.event
    const msg = event.value?.message
    const titleAndName = msg ? `${title} - ${msg}` : title
    return titleAndName;
  }
  return <div><MicroCard icons={icons} summary={getSummary ()}/></div>
}

export function displayMessageEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'append' && event.displayData?.type === 'message',
    microDisplay: DisplayDefaultEnrichedMessageEventMicro,
    fullDisplay: DisplayDefaultEnrichedMessageEventFull
  };
}
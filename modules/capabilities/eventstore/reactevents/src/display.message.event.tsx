import { EnrichedEvent } from "@itsmworkbench/events";
import { AppendEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { DisplayMarkdown, microCard, PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayEnrichedEventPlugIn } from "@itsmworkbench/reactevents";
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
      <Typography variant="body1">
        <DisplayMarkdown md={message}/>
      </Typography>
    </CardContent>
  </Card>
}
function getTruncatedMessage ( msg: string | undefined ) {
  if ( msg === undefined ) return undefined

  const msgLines = msg?.toString ().split ( '\n' ).map ( s => s.trim () ).filter ( s => s.length > 0 )
  if ( msgLines.length === 0 ) return undefined
  const firstLine = msgLines[ 0 ]
  if ( msgLines.length === 1 ) return firstLine
  return firstLine + '...'
}

export function displayMessageEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'append' && event.displayData?.type === 'message',
    microDisplay: microCard<AppendEvent> ( event => {
      const title = event.displayData?.title || event.event
      const msg = getTruncatedMessage ( event.value?.message )
      return msg ? `${title} - ${msg}` : title;
    } ),
    fullDisplay: DisplayDefaultEnrichedMessageEventFull
  };
}
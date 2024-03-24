import { EnrichedEvent, SetValueEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro, DisplayEnrichedEventPlugIn } from "@itsmworkbench/reactevents";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { isReceiveEmailWorkbenchContext } from "@itsmworkbench/domain";


export interface DisplayReceiveEmailEventProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<SetValueEvent, any>, any>> {
}

export function DisplayReceiveEmailEventFull<S> ( { state, icons }: DisplayReceiveEmailEventProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  let context = event.context;
  if ( !isReceiveEmailWorkbenchContext ( context ) ) return <div>Error: should be ReceiveEmail</div>
  const title = event.displayData?.title || event.event
  // const description = event.displayData?.value?.result?.description || '<Error: no description>'
  return <Card sx={{ width: '100%', maxWidth: '75vw' }}>
    {/* CardHeader for actions */}
    <CardHeader
      action={<Box display="flex" alignItems="center">{icons}</Box>}
      title={title}
      sx={{ position: 'relative', '.MuiCardHeader-action': { margin: 0, alignSelf: 'flex-start' } }}
    />
    <CardContent>
      <Typography variant="body1" component="pre">
        From: {context.data?.from}
      </Typography>
      <Typography variant="body1" component="pre">
        Email: {context.data?.email}
      </Typography>
    </CardContent>
  </Card>
}


export function displayReceiveEmailEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'setValue' && event.displayData?.type === 'ReceiveEmail',
    microDisplay: DisplayDefaultEnrichedEventMicro,
    fullDisplay: DisplayReceiveEmailEventFull
  };
}


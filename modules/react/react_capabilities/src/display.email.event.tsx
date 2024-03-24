import { EnrichedEvent } from "@itsmworkbench/events";
import { SetValueEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro, DisplayEnrichedEventPlugIn } from "@itsmworkbench/react_events";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { isEmailWorkBenchContext, EmailWorkBenchContext } from "@itsmworkbench/domain";


export interface DisplayEmailEventProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<SetValueEvent, any>, any>> {
}

export function DisplayEmailEventFull<S> ( { state, icons }: DisplayEmailEventProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  let context = event.context;
  if ( !isEmailWorkBenchContext ( context ) ) return <div>Error: should be sql</div>
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
        To: {context.data?.to}
      </Typography>
      <Typography variant="body1" component="pre">
        Subject: {context.data?.subject}
      </Typography>
      <Typography variant="body1" component="pre">
        Body: {context.data?.email}
      </Typography>
    </CardContent>
  </Card>
}


export function displayEmailEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'setValue' && event.displayData?.type === 'Email',
    microDisplay: DisplayDefaultEnrichedEventMicro,
    fullDisplay: DisplayEmailEventFull
  };
}
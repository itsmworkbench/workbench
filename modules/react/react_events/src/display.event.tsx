import { LensProps } from "@focuson/state";
import React from "react";
import { Event } from "@itsmworkbench/events";
import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { MicroCard, PROPSAndIcons, SelectableSize } from "@itsmworkbench/components";
import { Box } from "@mui/material";

export type DisplayEventProps<S> = PROPSAndIcons<LensProps<S, Event, any>>
export function DisplayDefaultEventMicro<S> ( { state, icons }: DisplayEventProps<S> ) {
  return <MicroCard icons={icons} summary={JSON.stringify ( state.optJson () || 'No Even this is an error' )}/>
}
export function DisplayDefaultEventFull<S> ( { state, icons }: DisplayEventProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  return <Card>
    {/* CardHeader for actions */}
    <CardHeader
      action={<Box display="flex" alignItems="center">{icons}</Box>}
      title={event.event}
      sx={{ position: 'relative', '.MuiCardHeader-action': { margin: 0, alignSelf: 'flex-start' } }}
    />
    <CardContent>
      <Typography variant="body1" component="pre">
        {JSON.stringify ( event, null, 2 )}
      </Typography>
    </CardContent>
  </Card>
}


export function DisplayEvent<S> ( props: LensProps<S, Event, any> ) {
  const event = props.state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  return <SelectableSize
    MicroComponent={DisplayDefaultEventMicro<S>}
    FullComponent={DisplayDefaultEventFull<S>}
    data={props}
  />
}
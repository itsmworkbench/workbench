import { LensProps } from "@focuson/state";
import React from "react";
import { Event } from "@itsmworkbench/events";
import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { MicroCard, PROPSAndIcons, SelectableSize } from "@itsmworkbench/components";
import { Box } from "@mui/material";
import { EnrichedEvent } from "@itsmworkbench/enrichedevents";

export type DisplayEnrichedEventProps<S> = PROPSAndIcons<LensProps<S, EnrichedEvent<any, any>, any>>
export function DisplayDefaultEnrichedEventMicro<S> ( { state, icons }: DisplayEnrichedEventProps<S> ) {
  function getSummary () {
    const event = state.optJson ()
    if ( event === undefined ) return 'No event - This is an error'
    const title = event.displayData?.title || event.event
    return title;
  }
  return <MicroCard icons={icons} summary={getSummary ()}/>
}
export function DisplayDefaultEnrichedEventFull<S> ( { state, icons }: DisplayEnrichedEventProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  const title = event.displayData?.title || event.event
  return <Card>
    {/* CardHeader for actions */}
    <CardHeader
      action={<Box display="flex" alignItems="center">{icons}</Box>}
      title={title}
      sx={{ position: 'relative', '.MuiCardHeader-action': { margin: 0, alignSelf: 'flex-start' } }}
    />
    <CardContent>
      <Typography variant="body1" component="pre">
        {JSON.stringify ( event, null, 2 )}
      </Typography>
    </CardContent>
  </Card>
}


export function DisplayEnrichedEvent<S> ( props: LensProps<S, Event, any> ) {
  const event = props.state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  return <SelectableSize
    MicroComponent={DisplayDefaultEnrichedEventMicro<S>}
    FullComponent={DisplayDefaultEnrichedEventFull<S>}
    data={props}
  />
}
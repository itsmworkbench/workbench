import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { SetIdEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro } from "@itsmworkbench/react_events";
import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { Box } from "@mui/material";
import { DisplayEnrichedEventPlugIn } from "@itsmworkbench/react_events";


export interface DisplayTicketEventMiniProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<SetIdEvent, any>, any>> {
}

export function DisplayDefaultEnrichedHistoryEventFull<S> ( { state, icons }: DisplayTicketEventMiniProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  const title = event.displayData?.title || event.event
  const name = event.context?.display?.name
  const titleAndName = name ? `${title} - ${name}` : title
  const description = event.displayData?.value?.result?.description || '<Error: no description>'
  return <Card>
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
    fullDisplay: DisplayDefaultEnrichedHistoryEventFull
  };
}
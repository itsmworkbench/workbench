import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { InfoEvent, SetIdEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { DisplayYaml, MicroCard, PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro, DisplayEnrichedEventPlugIn, DisplayEnrichedEventProps } from "@itsmworkbench/react_events";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";

export function DisplayVariablesEventMicro<S> ( { state, icons }: DisplayEnrichedEventProps<S> ) {
  function getSummary () {
    const event = state.optJson ()
    if ( event === undefined ) return <div>No event - This is an error</div>
    const title = event.displayData?.title || event.event
    const info = event?.info
    const titleAndInfo = info ? `${title} - ${JSON.stringify ( info )}` : title
    return titleAndInfo
  }
  return <div><MicroCard icons={icons} summary={getSummary ()}/></div>
}
export interface DisplayVariablesEventMiniProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<InfoEvent, any>, any>> {
}

export function DisplayDefaultEnrichedHistoryEventFull<S> ( { state, icons }: DisplayVariablesEventMiniProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  const title = event.displayData?.title || event.event
  const info = event?.info
  return <Card sx={{ width: '100%', maxWidth: '75vw' }}>
    {/* CardHeader for actions */}
    <CardHeader
      action={<Box display="flex" alignItems="center">{icons}</Box>}
      title={<Box
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 'calc(75vw - 100px)', // Adjust the 100px based on the estimated width of the actions
        }}
      >
        {title}
      </Box>}
      sx={{ position: 'relative', '.MuiCardHeader-action': { margin: 0, alignSelf: 'flex-start' } }}
    />
    <CardContent>
      <Typography variant="body1">
        <DisplayYaml yaml={info || {}}/>
      </Typography>
    </CardContent>
  </Card>
}


export function displayVariablesEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'info' && event.displayData?.type === 'variables',
    microDisplay: DisplayVariablesEventMicro,
    fullDisplay: DisplayDefaultEnrichedHistoryEventFull
  };
}
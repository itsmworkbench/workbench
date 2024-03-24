import { EnrichedEvent } from "@itsmworkbench/events";
import { SetValueEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro, DisplayEnrichedEventPlugIn } from "@itsmworkbench/reactevents";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { isSqlWorkBenchContext, SqlWorkBenchContext } from "@itsmworkbench/domain";


export interface DisplaySqlEventProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<SetValueEvent, any>, any>> {
}

export function DisplaySqlEventFull<S> ( { state, icons }: DisplaySqlEventProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  let context = event.context;
  if ( !isSqlWorkBenchContext ( context ) ) return <div>Error: should be sql</div>
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
        Sql: {context.data?.sql}
      </Typography>
      <Typography variant="body1" component="pre">
        Response: {context.data?.response}
      </Typography>
    </CardContent>
  </Card>
}


export function
displaySqlEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'setValue' && event.displayData?.type === 'SQL',
    microDisplay: DisplayDefaultEnrichedEventMicro,
    fullDisplay: DisplaySqlEventFull
  };
}
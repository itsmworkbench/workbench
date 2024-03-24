import { EnrichedEvent } from "@itsmworkbench/events";
import { SetValueEvent } from "@itsmworkbench/events";
import { LensProps } from "@focuson/state";
import { PROPSAndIcons } from "@itsmworkbench/components";
import React from "react";
import { DisplayDefaultEnrichedEventMicro, DisplayEnrichedEventPlugIn } from "@itsmworkbench/reactevents";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { isLdapWorkBenchContext } from "@itsmworkbench/domain";


export interface DisplayLdapEventProps<S> extends PROPSAndIcons<LensProps<S, EnrichedEvent<SetValueEvent, any>, any>> {
}

export function DisplayLdapEventFull<S> ( { state, icons }: DisplayLdapEventProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  let context = event.context;
  if ( !isLdapWorkBenchContext ( context ) ) return <div>Error: should be sql</div>
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
        To: {context.data?.email}
      </Typography>
      <Typography variant="body1" component="pre">
        Subject: {context.data?.response}
      </Typography>
    </CardContent>
  </Card>
}


export function displayLdapEventPlugin<S extends any> (): DisplayEnrichedEventPlugIn<S> {
  return {
    accept: ( event: EnrichedEvent<any, any> ) => event.event === 'setValue' && event.displayData?.type === 'LDAP',
    microDisplay: DisplayDefaultEnrichedEventMicro,
    fullDisplay: DisplayLdapEventFull
  };
}
import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { Box } from '@mui/material';
import { DisplayEnrichedEventProps } from "@itsmworkbench/react_events/";
import { EnrichedEvent } from "@itsmworkbench/events";
import { BaseEvent } from "@itsmworkbench/events";
import { StatusIndicator } from "../status.indicator";

export type MicroCardFnProps = {
  icons: React.ReactNode;
};
export type MicroCardProps = {
  summary: string;
  icons: React.ReactNode;
  successOrFailure?: boolean;
};

export function microCard<E extends BaseEvent> ( summaryFn: ( event: EnrichedEvent<E, any> ) => string ) {
  return <S, > ( { state, icons }: DisplayEnrichedEventProps<S> ) => {
    let event = state.optJson ();
    if ( event === undefined ) return <div>No event - This is an error</div>;
    const successOrFailure= event.context?.display?.successOrFail;
    return <div><MicroCard icons={icons} summary={summaryFn ( event )}successOrFailure={successOrFailure}/></div>;
  };
}
export function MicroCard ( { summary, icons, successOrFailure }: MicroCardProps ) {
  console.log ( 'MicroCard', successOrFailure, summary, icons, );
  return (
    <Card sx={{ width: '100%', maxWidth: '75vw' }}>
      <CardHeader
        action={
          <Box display="flex" alignItems="center">
            {icons}
          </Box>
        }

        title={<Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 'calc(75vw - 100px)', // Adjust the 100px based on the estimated width of the actions
          }}
        >{successOrFailure  !== undefined&& <StatusIndicator value={successOrFailure}/>}
          {summary}
        </Box>}
        titleTypographyProps={{ variant: 'body2', noWrap: true }} // Adjust typography as needed
        sx={{ paddingBottom: '8px', paddingTop: '8px' }} // Minimize vertical padding
      />
    </Card>
  );
}
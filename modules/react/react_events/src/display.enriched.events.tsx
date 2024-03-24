import { LensProps } from "@focuson/state";
import React from "react";
import { Event } from "@itsmworkbench/events";
import { List, ListItem } from "@material-ui/core";
import { Lenses } from "@focuson/lens";
import { EnrichedEvent } from "@itsmworkbench/events";
import { DisplayEnrichedEvent } from "./display.enriched.event";

export interface DisplayEnrichedEventsProps<S> extends LensProps<S,EnrichedEvent<any, any>[], any> {
}
export function DisplayEnrichedEvents<S> ( { state }: DisplayEnrichedEventsProps<S> ) {
  const events:EnrichedEvent<any, any>[] = state.optJson () || []
  return (<List>
    {events.map ( ( ticket, index ) => (
      <ListItem>
        <DisplayEnrichedEvent state={state.chainLens ( Lenses.nth<Event> ( index ) )}/>
      </ListItem>
    ) )}
  </List>);
}
import { LensProps } from "@focuson/state";
import React from "react";
import { Event } from "@itsmworkbench/events";
import { List, ListItem } from "@material-ui/core";
import { Lenses } from "@focuson/lens";
import { DisplayEvent } from "./display.event";


export interface DisplayEventsProps<S> extends LensProps<S, Event[], any> {
}
export function DisplayEvents<S> ( { state }: DisplayEventsProps<S> ) {
  const events = state.optJson () || []
  return (<List>
    {events.map ( ( ticket, index ) => (
      <ListItem>
        <DisplayEvent state={state.chainLens ( Lenses.nth<Event> ( index ) )}/>
      </ListItem>
    ) )}
  </List>);
}
import React, { useContext } from "react";
import { SideEffect } from "@itsmworkbench/react_core";
import { LensState } from "@focuson/state";
import { useEnrichedEvents } from "./useEnrichedEvents";
import { EnrichedEvent } from "@itsmworkbench/events";


export function useVariables<S> (): any {
  const events: EnrichedEvent<any, any>[] = useEnrichedEvents ()
  // return events;
  const filtered = events.filter ( e => e?.context?.data?.attributes )
  // return filtered
  const found = filtered.length === 0 ? {} : filtered[ filtered.length - 1 ].context.data.attributes
  return found;
}

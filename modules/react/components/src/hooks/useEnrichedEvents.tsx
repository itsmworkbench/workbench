// Service implementation
import React, { useContext } from "react";
import { EnrichedEvent } from "@itsmworkbench/events";
import { TicketType } from "@itsmworkbench/tickettype";
import { findActionsInEventsMergeWithTicketType, lastTicketType } from "@itsmworkbench/defaultdomains";


export interface EnrichedEventsProviderProps {
  enrichedEvents: EnrichedEvent<any, any>[] | undefined
  children: React.ReactNode;

}
export const EnrichedEventsContext = React.createContext<EnrichedEvent<any, any>[] | undefined> ( undefined )
export function EnrichedEventsProvider ( { children, enrichedEvents }: EnrichedEventsProviderProps ) {
  return <EnrichedEventsContext.Provider value={enrichedEvents || []}> {children} </EnrichedEventsContext.Provider>;
}


export function useEnrichedEvents (): EnrichedEvent<any, any>[] {
  const results = useContext ( EnrichedEventsContext );
  if ( results === undefined ) {
    throw new Error ( "useEnrichedEvents  must be used within a EnrichedEventsProvider" );
  }
  return results;
}

export function useTicketType (): TicketType|undefined {
  let enriched = useEnrichedEvents ();
  let result = lastTicketType ( enriched );
  return result
}
export function useTicketTypeVariables (): string[] {
  return useTicketType ()?.variables || []
}


export function useActionInEventsFor ( phase: string, action: string ) {
  let events = useEnrichedEvents ();
  const ticketType: TicketType = lastTicketType ( events )
  return findActionsInEventsMergeWithTicketType ( ticketType, events, phase, action )
}
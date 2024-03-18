// Service implementation
import React, { useContext } from "react";
import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { TicketType } from "@itsmworkbench/tickettype";
import { findActionsInEventsMergeWithTicketType, lastTicketType } from "@itsmworkbench/knowledge_articles";


export interface EnrichedEventsProviderProps {
  enrichedEvents: EnrichedEvent<any, any>[]
  children: React.ReactNode;

}
export const EnrichedEventsContext = React.createContext<EnrichedEvent<any, any>[]> ( [] );
export function EnrichedEventsProvider ( { children, enrichedEvents }: EnrichedEventsProviderProps ) {
  return <EnrichedEventsContext.Provider value={enrichedEvents || []}> {children} </EnrichedEventsContext.Provider>;
}

// Hook for consuming the service
export function useEnrichedEvents (): EnrichedEvent<any, any>[] {
  const results = useContext ( EnrichedEventsContext ) || [];
  if ( results === undefined ) {
    throw new Error ( "useEnrichedEvents  must be used within a EnrichedEventsProvider" );
  }
  return results;
}

export function useTicketType (): TicketType {
  let result = lastTicketType ( useEnrichedEvents () );
  return result
}
export function useActionInEventsFor ( phase: string, action: string ) {
  let events = useEnrichedEvents ();
  const ticketType: TicketType = lastTicketType ( events )
  return findActionsInEventsMergeWithTicketType ( ticketType, events, phase, action )
}
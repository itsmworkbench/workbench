import { Event } from "@itsmworkbench/events";
import { EnrichedEvent } from "@itsmworkbench/events";

export interface EventsAndEnriched {
  events: Event[]
  enrichedEvents: EnrichedEvent<any, any>[]
}
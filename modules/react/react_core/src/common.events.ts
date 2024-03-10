import { Event } from "@itsmworkbench/events";
import { EnrichedEvent } from "@itsmworkbench/enrichedevents";

export interface EventsAndEnriched {
  events: Event[]
  enrichedEvents: EnrichedEvent<any, any>[]
}
import { AppendEvent, BaseEvent, ErrorEvent, EventNameAnd, SetIdEvent, SetValueEvent, ZeroEvent } from "@itsmworkbench/events";
import { loadFromString, UrlLoaders, UrlLoadIdentityFn, UrlStore } from "@itsmworkbench/url";
import { mapErrorsK } from "@laoban/utils";

export type EnrichedEvent<E extends BaseEvent, D> = E & { displayData: D }

export interface GeneralDisplayData {
  title?: string
  type?: string
}
export interface DisplaySetId extends GeneralDisplayData {
  value: any
}

export type EventEnricher = {
  zero: EnricherFn<ZeroEvent, GeneralDisplayData>
  setId: EnricherFn<SetIdEvent, DisplaySetId>
  setValue: EnricherFn<SetValueEvent, GeneralDisplayData>
  append: EnricherFn<AppendEvent, GeneralDisplayData>
  error: EnricherFn<ErrorEvent, GeneralDisplayData>
}

export type EnricherFn<E extends BaseEvent, D> = ( event: E ) => Promise<EnrichedEvent<E, D>>
export function defaultEventEnricher ( urlLoaders: UrlLoaders ): EventEnricher {
  return {
    zero: async ( event ) => ({ ...event, displayData: {} }),
    setId: async ( event ) => ({ ...event, displayData: { value: await loadFromString ( urlLoaders, event.id ) } }),
    setValue: async ( event ) => ({ ...event, displayData: {} }),
    append: async ( event ) => ({ ...event, displayData: {} }),
    error: async ( event ) => ({ ...event, displayData: {} })
  }
}

export const enrichEvent = ( eventEnricher: EventEnricher ) => async <E extends BaseEvent> ( event: E ): Promise<EnrichedEvent<E, any>> => {
  const enricher: EnricherFn<E, any> = eventEnricher[ event.event ] as any
  if ( !enricher ) throw new Error ( `No enricher for event ${event.event}` )
  const enriched = await enricher ( event );
  const context = event.context || {}
  const display = context?.display
  const title = display?.title
  const type = display?.type
  return { ...enriched, displayData: { title, type, ...enriched.displayData } }
};
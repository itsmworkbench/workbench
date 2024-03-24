import { loadFromString, UrlLoaders } from "@itsmworkbench/urlstore";
import { AppendEvent, BaseEvent, InfoEvent, SetIdEvent, SetValueEvent, ZeroEvent ,ErrorEvent} from "./events";

export type EnrichedEvent<E extends BaseEvent, D> = E & { displayData: D, hide: boolean }

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
  info: EnricherFn<InfoEvent, GeneralDisplayData>
  error: EnricherFn<ErrorEvent, GeneralDisplayData>
}

export type EnricherFn<E extends BaseEvent, D> = ( event: E ) => Promise<EnrichedEvent<E, D>>
export function defaultEventEnricher ( urlLoaders: UrlLoaders ): EventEnricher {
  const hide = ( event: BaseEvent ) => event.context?.display?.hide || false
  return {
    zero: async ( event ) => ({ ...event, displayData: {}, hide: hide ( event ) }),
    setId: async ( event ) => ({ ...event, displayData: { value: await loadFromString ( urlLoaders, event.id ) }, hide: hide ( event ) }),
    setValue: async ( event ) => ({ ...event, displayData: {}, hide: hide ( event ) }),
    append: async ( event ) => ({ ...event, displayData: {}, hide: hide ( event ) }),
    info: async ( event ) => ({ ...event, displayData: {}, hide: hide ( event ) }),
    error: async ( event ) => ({ ...event, displayData: {}, hide: hide ( event ) })
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
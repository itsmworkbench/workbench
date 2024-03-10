import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { LensProps, LensState } from "@focuson/state";
import React, { ComponentType } from "react";
import { PROPSAndIcons, SelectableSize } from "@itsmworkbench/components/dist/src/layouts/selectable.size";
import { DisplayDefaultEnrichedEventFull, DisplayDefaultEnrichedEventMicro, DisplayEnrichedEvent } from "./display.enriched.event";
import { Lenses } from "@focuson/lens";

export interface DisplayEnrichedEventPlugIn<S> {
  accept: ( event: EnrichedEvent<any, any> ) => boolean
  microDisplay: ComponentType<PROPSAndIcons<LensProps<S, EnrichedEvent<any, any>, any>>>;
  miniDisplay?: ComponentType<PROPSAndIcons<LensProps<S, EnrichedEvent<any, any>, any>>>
  fullDisplay: ComponentType<PROPSAndIcons<LensProps<S, EnrichedEvent<any, any>, any>>>;
}

export interface DisplayEnrichedEventUsingPluginProps<S> extends LensProps<S, EnrichedEvent<any, any>, any> {
  plugins: DisplayEnrichedEventPlugIn<S>[]
}

export function DisplayEnrichedEventUsingPlugin<S> ( { state, plugins }: DisplayEnrichedEventUsingPluginProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  const plugin = plugins.find ( p => p.accept ( event ) )
  console.log('plugin', plugin, 'event', event, 'state', state)
  if ( plugin === undefined ) return <DisplayEnrichedEvent state={state}/>
  return <SelectableSize
    MicroComponent={plugin.microDisplay}
    MiniComponent={plugin.miniDisplay}
    FullComponent={plugin.fullDisplay}
    data={{ state }}
  />
}
export interface DisplayEnrichedEventsUsingPluginProps<S> extends LensProps<S, EnrichedEvent<any, any>[], any> {
  plugins: DisplayEnrichedEventPlugIn<S>[]
}
export function DisplayEnrichedEventsUsingPlugin<S> ( { state, plugins }: DisplayEnrichedEventsUsingPluginProps<S> ) {
  const events = state.optJson () || []
  return <div>    {events.map ( ( event, i ) =>
    <DisplayEnrichedEventUsingPlugin key={i}
                                     state={state.chainLens ( Lenses.nth ( i ) )}
                                     plugins={plugins}/> )}
  </div>
}

import { EnrichedEvent } from "@itsmworkbench/enrichedevents";
import { LensProps, LensState } from "@focuson/state";
import React, { ComponentType } from "react";
import { PROPSAndIcons, SelectableSize } from "@itsmworkbench/components";
import { DisplayDefaultEnrichedEventFull, DisplayDefaultEnrichedEventMicro, DisplayEnrichedEvent } from "./display.enriched.event";
import { Lenses } from "@focuson/lens";

export interface DisplayEnrichedEventPlugIn<S> {
  accept: ( event: EnrichedEvent<any, any> ) => boolean
  microDisplay: ComponentType<PROPSAndIcons<LensProps<S, EnrichedEvent<any, any>, any>>>;
  miniDisplay?: ComponentType<PROPSAndIcons<LensProps<S, EnrichedEvent<any, any>, any>>>
  fullDisplay: ComponentType<PROPSAndIcons<LensProps<S, EnrichedEvent<any, any>, any>>>;
  debugDisplay?: ComponentType<PROPSAndIcons<LensProps<S, EnrichedEvent<any, any>, any>>>;
}

export interface DisplayEnrichedEventUsingPluginProps<S> extends LensProps<S, EnrichedEvent<any, any>, any> {
  plugins: DisplayEnrichedEventPlugIn<S>[]
}

export function DisplayEnrichedEventUsingPlugin<S> ( { state, plugins }: DisplayEnrichedEventUsingPluginProps<S> ) {
  const event = state.optJson ()
  if ( event === undefined ) return <div>No event - This is an error</div>
  const plugin = plugins.find ( p => p.accept ( event ) )
  if ( plugin === undefined ) return <DisplayEnrichedEvent state={state}/>
  let debugComponent = plugin.debugDisplay || DisplayDefaultEnrichedEventFull<S>;
  return <SelectableSize
    MicroComponent={plugin.microDisplay}
    MiniComponent={plugin.miniDisplay}
    FullComponent={plugin.fullDisplay}
    DebugComponent={debugComponent}
    data={{ state }}
  />
}
export interface DisplayEnrichedEventsUsingPluginProps<S> extends LensProps<S, EnrichedEvent<any, any>[], any> {
  devMode?: boolean
  plugins: DisplayEnrichedEventPlugIn<S>[]
}
export function DisplayEnrichedEventsUsingPlugin<S> ( { state, plugins, devMode }: DisplayEnrichedEventsUsingPluginProps<S> ) {
  const events = state.optJson () || []
  // console.log ( 'DisplayEnrichedEventsUsingPlugin events', events, 'devMode', devMode, 'plugins', plugins )
  return <div>{events.map ( ( event, i ) =>
    <div key={i} style={{ margin: '6px' }}>
      {(devMode || !event.hide) && <DisplayEnrichedEventUsingPlugin key={i}
                                                                   state={state.chainLens ( Lenses.nth ( i ) )}
                                                                   plugins={plugins}/>}
    </div> )}
  </div>
}

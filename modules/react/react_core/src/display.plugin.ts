import { LensProps, LensState } from "@focuson/state";
import { Event } from "@itsmworkbench/events";

export interface DisplayPluginDetails<S, Props> {
  props: <State>( s: LensState<State, S, any> ) => Props
  render: ( s: S, props: Props ) => React.ReactElement
}

export type ActionPlugIn<S, Props> = ( props: <State, >( s: LensState<State, S, any> ) => Props ) => ActionPluginDetails<S, Props>
export interface ActionPluginDetails<S, Props> extends DisplayPluginDetails<S, Props> {
  by: string
}

export const DisplayPlugin = <State, S> ( state: LensState<State, S, any> ) =>
  <Props> ( plugin: DisplayPluginDetails<S, Props> ) => { return plugin.render ( state.optJson (), plugin.props ( state ) )}


export const DisplayActionPlugin = <S, Props> ( plugins: ActionPluginDetails<S, Props>[], def: () => React.ReactElement | undefined ) =>
  <State, > ( state: LensState<State, S, any>, byFn: ( s: S | undefined ) => string ) => {
    const by = byFn ( state.optJson () )
    const plugin = plugins.find ( p => p.by === by )
    return plugin ? plugin.render ( state.optJson (), plugin.props ( state ) ) : def;
  }
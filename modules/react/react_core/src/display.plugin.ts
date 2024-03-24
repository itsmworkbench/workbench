import { LensState } from "@focuson/state";
import { Capability } from "@itsmworkbench/domain";

export interface DisplayPluginDetails<S, Props> {
  props: <State>( s: LensState<State, S, any> ) => Props
  render: ( props: Props ) => React.ReactElement
}
export interface ActionPluginDetails<S, Props> extends DisplayPluginDetails<S, Props> {
  by: string
}

export const DisplayPlugin = <State, S> ( state: LensState<State, S, any> ) =>
  <Props> ( plugin: DisplayPluginDetails<S, Props> ) => { return plugin.render ( plugin.props ( state ) )}


export const DisplayActionPlugin = <S, Props> ( plugins: ActionPluginDetails<S, Props>[], def: () => React.ReactElement ) =>
  <State, > ( state: LensState<State, S, any>, byFn: ( s: S | undefined ) => string ) => {
    const by = byFn ( state.optJson () )
    const plugin = plugins.find ( p => p.by === by )
    return plugin ? plugin.render ( plugin.props ( state ) ) : def;
  }
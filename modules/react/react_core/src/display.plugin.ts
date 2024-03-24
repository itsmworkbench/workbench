import { LensProps, LensState } from "@focuson/state";
import { Event } from "@itsmworkbench/events";
import { Optional } from "@focuson/lens";

export interface DisplayPluginDetails<S, State,Props> {
  props: ( s: LensState<S, State, any> ) => Props
  render: ( s: State, props: Props ) => React.ReactElement
}

export type ActionPlugIn<S, State,Props> = ( props: ( s: LensState<S, State, any> ) => Props ) => ActionPluginDetails<S,State, Props>
export interface ActionPluginDetails<S, State,Props> extends DisplayPluginDetails<S,State, Props> {
  by: string
}


export function displayActionPlugin<S, State> ( plugins: ActionPluginDetails<S, State, any>[], def: () => (React.ReactElement | undefined), byO: Optional<State, string> ) {
  return  ( state: LensState<S, State, any> ): React. ReactElement|undefined => {
    let s = state.optJson ();
    const by = s !== undefined && byO.getOption ( s )
    const plugin = plugins.find ( p => p.by === by )
    return plugin ? plugin.render ( s, plugin.props ( state ) ) : def();
  };
}
import { K0, K1, K2, K3, K4, K5, LogConfig, LogConfig0, LogConfig1, LogConfig2, LogConfig3, LogConfig4, LogConfig5, LoggingHookState } from "@itsmworkbench/kleislis";
import { ActivityCommon, ActivityEngine, createRawActivity } from "@itsmworkbench/activities";
import { AsyncLocalStorage } from "async_hooks";
import { runWithLoggingHookState } from "./node.log";

const activityEngineState = new AsyncLocalStorage<ActivityEngine> ()

export function runWithActivityEngine<T> ( state: ActivityEngine, fn: () => T ): T {
  return activityEngineState.run ( state, fn )
}
export function runWithLoggedActivityEngine<T> ( state: ActivityEngine, log: LoggingHookState, fn: () => T ): T {
  return runWithActivityEngine ( state, () => runWithLoggingHookState ( log, fn ) )
}
export function useActivityEngine (): ActivityEngine {
  const store = activityEngineState.getStore ()
  if ( store ) {
    return store
  }
  throw new Error ( 'Activity Engine not available' )
}

export type NodeActivity0<T> = K0<T> & { raw: K0<T>, config: ActivityCommon }
export type NodeActivity1<P1, T> = K1<P1, T> & { raw: K1<P1, T>, config: ActivityCommon }
export type NodeActivity2<P1, P2, T> = K2<P1, P2, T> & { raw: K2<P1, P2, T>, config: ActivityCommon }
export type NodeActivity3<P1, P2, P3, T> = K3<P1, P2, P3, T> & { raw: K3<P1, P2, P3, T>, config: ActivityCommon }
export type NodeActivity4<P1, P2, P3, P4, T> = K4<P1, P2, P3, P4, T> & { raw: K4<P1, P2, P3, P4, T>, config: ActivityCommon }
export type NodeActivity5<P1, P2, P3, P4, P5, T> = K5<P1, P2, P3, P4, P5, T> & { raw: K5<P1, P2, P3, P4, P5, T>, config: ActivityCommon }
export type NodeActivity<T> = NodeActivity0<T> | NodeActivity1<any, T> | NodeActivity2<any, any, T> | NodeActivity3<any, any, any, T> | NodeActivity4<any, any, any, any, T> | NodeActivity5<any, any, any, any, any, T>

export function nodeActivity<T> ( config: ActivityCommon & LogConfig0<T>, fn: K0<T> ): NodeActivity0<T>
export function nodeActivity<P1, T> ( config: ActivityCommon & LogConfig1<P1, T>, fn: K1<P1, T> ): NodeActivity1<P1, T>
export function nodeActivity<P1, P2, T> ( config: ActivityCommon & LogConfig2<P1, P2, T>, fn: K2<P1, P2, T> ): NodeActivity2<P1, P2, T>
export function nodeActivity<P1, P2, P3, T> ( config: ActivityCommon & LogConfig3<P1, P2, P3, T>, fn: K3<P1, P2, P3, T> ): NodeActivity3<P1, P2, P3, T>
export function nodeActivity<P1, P2, P3, P4, T> ( config: ActivityCommon & LogConfig4<P1, P2, P3, P4, T>, fn: K4<P1, P2, P3, P4, T> ): NodeActivity4<P1, P2, P3, P4, T>
export function nodeActivity<P1, P2, P3, P4, P5, T> ( config: ActivityCommon & LogConfig5<P1, P2, P3, P4, P5, T>, fn: K5<P1, P2, P3, P4, P5, T> ): NodeActivity5<P1, P2, P3, P4, P5, T>
export function nodeActivity<T> ( config: ActivityCommon & LogConfig<T>, fn: ( ...args: any[] ) => Promise<T> ): any {
  const a = createRawActivity ( config, fn );
  const newFn = ( ...args: any[] ) => {
    const engine = useActivityEngine ();
    return a ( engine ) (... args )
  }
  newFn[ 'raw' ] = fn
  newFn[ 'config' ] = config
  return newFn as NodeActivity<T>
}

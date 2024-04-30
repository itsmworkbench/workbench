import { consoleLog, defaultRetryPolicy, IncMetric, Injected, InjectedK0, InjectedK1, InjectedK2, InjectedK3, InjectedK4, InjectedK5, K0, K1, K2, K3, K4, K5, Kleisli, LogConfig, LogConfig0, LogConfig1, LogConfig2, LogConfig3, LogConfig4, LogConfig5, nullIncMetric, ReplayEvent, RetryPolicyConfig, Sideeffect, Throttling, withDebug, withMeteredRetry, withThrottle, withWriteMetrics } from "@itsmworkbench/kleislis";

import { ReplayEngine, withReplay } from "@itsmworkbench/kleislis";
import { LogFn } from "@itsmworkbench/kleislis";

export type ActivityCommon = { id: string, retry?: RetryPolicyConfig, throttle?: Throttling, debug?: boolean, logFn?: LogFn }

export interface ActivityEngine extends ReplayEngine <any> { // it's really a E extends ReplyEvent. But this damages the type signatures of activity a lot
  writeMetrics?: Sideeffect
  logFn?: LogFn
}

export type Activity0<T> = InjectedK0<ActivityEngine, T> & { raw: K0<T>, config: ActivityCommon }
export type Activity1<P1, T> = InjectedK1<ActivityEngine, P1, T> & { raw: K1<P1, T>, config: ActivityCommon }
export type Activity2<P1, P2, T> = InjectedK2<ActivityEngine, P1, P2, T> & { raw: K2<P1, P2, T>, config: ActivityCommon }
export type Activity3<P1, P2, P3, T> = InjectedK3<ActivityEngine, P1, P2, P3, T> & { raw: K3<P1, P2, P3, T>, config: ActivityCommon }
export type Activity4<P1, P2, P3, P4, T> = InjectedK4<ActivityEngine, P1, P2, P3, P4, T> & { raw: K4<P1, P2, P3, P4, T>, config: ActivityCommon }
export type Activity5<P1, P2, P3, P4, P5, T> = InjectedK5<ActivityEngine, P1, P2, P3, P4, P5, T> & { raw: K5<P1, P2, P3, P4, P5, T>, config: ActivityCommon }
export type Activity<T> = Activity0<T> | Activity1<any, T> | Activity2<any, any, T> | Activity3<any, any, any, T> | Activity4<any, any, any, any, T> | Activity5<any, any, any, any, any, T>

export function activity<T> ( config: ActivityCommon & LogConfig0<T>, fn: K0<T> ): Activity0<T>
export function activity<P1, T> ( config: ActivityCommon & LogConfig1<P1, T>, fn: K1<P1, T> ): Activity1<P1, T>
export function activity<P1, P2, T> ( config: ActivityCommon & LogConfig2<P1, P2, T>, fn: K2<P1, P2, T> ): Activity2<P1, P2, T>
export function activity<P1, P2, P3, T> ( config: ActivityCommon & LogConfig3<P1, P2, P3, T>, fn: K3<P1, P2, P3, T> ): Activity3<P1, P2, P3, T>
export function activity<P1, P2, P3, P4, T> ( config: ActivityCommon & LogConfig4<P1, P2, P3, P4, T>, fn: K4<P1, P2, P3, P4, T> ): Activity4<P1, P2, P3, P4, T>
export function activity<P1, P2, P3, P4, P5, T> ( config: ActivityCommon & LogConfig5<P1, P2, P3, P4, P5, T>, fn: K5<P1, P2, P3, P4, P5, T> ): Activity5<P1, P2, P3, P4, P5, T>


export function activity<T> ( config: ActivityCommon & LogConfig<T>, fn: ( ...args: any[] ) => Promise<T> ): any {
  const newFn = createRawActivity ( config, fn );
  newFn[ 'config' ] = config
  newFn[ 'raw' ] = fn
  return newFn as Injected<ActivityEngine, T> & { config: ActivityCommon, raw: Kleisli<T> }
}

export function createRawActivity<T> ( config: (ActivityCommon & LogConfig0<T>) | (ActivityCommon & LogConfig1<any, T>) | (ActivityCommon & LogConfig2<any, any, T>) | (ActivityCommon & LogConfig3<any, any, any, T>) | (ActivityCommon & LogConfig4<any, any, any, any, T>) | (ActivityCommon & LogConfig5<any, any, any, any, any, T>), fn: ( ...args: any[] ) => Promise<T> ) {
  const newFn = ( e: ActivityEngine ): (( ...args: any[] ) => Promise<T>) => {
    const incMetric = e.incMetric ? e.incMetric : nullIncMetric;
    const retryPolicy = config.retry || defaultRetryPolicy;
    const log = config.logFn ? config.logFn : consoleLog;
    let acc = fn as Kleisli<T>
    if ( config?.debug ) acc =
      withDebug ( config, log, acc )
    if ( config?.throttle ) acc =
      withThrottle ( config.throttle, acc )
    if ( config?.retry ) acc =
      withMeteredRetry ( retryPolicy, incMetric, acc )
    if ( e.updateEventHistory ) acc =
      withReplay ( config.id, acc ) ( e )
    if ( e.writeMetrics ) acc =
      withWriteMetrics ( e.writeMetrics, acc )
    return acc
  }
  return newFn;
}
import { NameAnd } from "@laoban/utils";
import { useMetricHookState } from "./async.hooks";

export type IncMetric = ( metricName: string ) => void

export function inMemoryIncMetric ( metrics: NameAnd<number> ): IncMetric {
  return ( metricName: string ) => {
    if ( metrics[ metricName ] === undefined ) metrics[ metricName ] = 0
    metrics[ metricName ]++
  }
}
export const nullIncMetric: IncMetric = () => {}

export function withWriteMetrics<T> ( fn: ( ...args: any[] ) => Promise<T> ): ( ...args: any ) => Promise<T> {
  return async ( ...args: any[] ) => {
    const state = useMetricHookState ()
    try {
      return await fn ( ...args )
    } finally {
      if ( state.writeMetrics )
        await state.writeMetrics?. ()
    }
  }
}



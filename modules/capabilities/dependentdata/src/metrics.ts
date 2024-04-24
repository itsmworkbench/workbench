export type DDMetrics = {
  attempts?: number; // Total number of fetch attempts
  retryAttempts?: number; // Total number of retry attempts
  cacheHits?: number; // Number of times the value was retrieved from cache
  successes?: number; // Number of successful fetches
  failures?: number; // Number of failed fetches
}
export type MetricName = keyof DDMetrics

export type HasDDMetrics = {
  metrics?: DDMetrics
}

export function incrementMetric ( holder: HasDDMetrics, metric: MetricName ) {
  if ( !holder.metrics ) holder.metrics = {}
  holder.metrics[ metric ] = (holder.metrics[ metric ] || 0) + 1

}
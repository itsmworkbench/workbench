export type Throttling = {
  current: number;
  kill?: boolean;
  max: number;
  throttlingDelay: number;    // Max random delay before retrying in ms
  tokensPer100ms: number;
  intervalId?: NodeJS.Timeout;  // Store the interval ID here
};

export function withThrottle<T> ( throttle: Throttling, fn: ( ...args: any[] ) => Promise<T> ): ( ...args: any ) => Promise<T> {
  return async ( ...args: any[] ) => {
    const attemptInvoke = async () => {
      if ( throttle.current > 0 ) {
        throttle.current--;
        return fn ( ...args );
      } else {
        if ( throttle.intervalId === undefined ) return;
        const delay = Math.random () * throttle.throttlingDelay;
        await new Promise ( resolve => setTimeout ( resolve, delay ) );
        return attemptInvoke ();  // Retry the invocation
      }
    };
    startThrottling ( throttle )
    return attemptInvoke ();
  };
}

export function startThrottling ( throttle: Throttling ) {
  if ( throttle.intervalId || throttle.kill ) return;  // Idempotently handle already running intervals
  throttle.intervalId = setInterval ( () => {
    throttle.current = Math.min ( throttle.max, throttle.current + throttle.tokensPer100ms );
  }, 100 );
}

export function stopThrottling ( throttle: Throttling ) {
  if ( throttle.intervalId ) {
    clearInterval ( throttle.intervalId );
    throttle.kill = true
    throttle.intervalId = undefined;  // Clear the intervalId after stopping the loop
  }
}

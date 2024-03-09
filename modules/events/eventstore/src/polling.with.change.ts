import { ErrorsAnd, hasErrors } from "@laoban/utils";
import { UrlLoadResult } from "@itsmworkbench/url";

export interface ResultAndNewStart {
  result: string
  newStart: number
}
export interface PollingDetails<T> {
  debug?: boolean
  pollingInterval: number
  polling: boolean
  currentPoll: string | undefined
  start: number
  poll: () => string //can change. When it does we start from 0 again
  load: ( poll: string, start: number ) => Promise<ErrorsAnd<UrlLoadResult<T>>>
  errors: ( errors: string[] ) => void
  pollingCallback: ( t: T ) => void
}


export function polling<T> (
  pollingInterval: number,
  poll: () => string | undefined,
  load: ( poll: string, start: number ) => Promise<ErrorsAnd<UrlLoadResult<T>>>,
  pollingCallback: ( t: T ) => Promise<void>,
  start: number = 0, debug?: boolean ): PollingDetails<T> {
  return { pollingInterval, polling: false, pollingCallback, start, poll, load, currentPoll: undefined, debug, errors: e => console.error ( e ) }
}
async function poll<T> ( details: PollingDetails<T> ) {
  if ( details.debug ) console.log ( 'polling', details )
  if ( !details.polling ) return; // Exit if polling has been stopped
  const newPoll = details.poll ()
  if ( newPoll !== details.currentPoll ) {
    details.start = 0
    details.currentPoll = newPoll
    console.log ( 'polling - new poll', details )
  }
  if ( newPoll === undefined ) return setTimeout ( () => poll ( details ), details.pollingInterval );
  try {
    const loaded: ErrorsAnd<UrlLoadResult<T>> = await details.load ( details.currentPoll, details.start )
    console.log('loaded', loaded)
    if ( hasErrors ( loaded ) ) return details.errors ( loaded )
    const { result, fileSize } = loaded
    details.pollingCallback ( result );
    setTimeout ( () => poll ( { ...details, start: fileSize } ), details.pollingInterval );
  } catch
    ( e ) {
    console.error ( e )
    setTimeout ( () => poll ( details ), details.pollingInterval );
  }
}

export function startPolling<T> ( details: PollingDetails<T> ) {
  if ( details.polling ) throw Error ( `Polling already active for ${JSON.stringify ( details )}` );
  details.polling = true;
  poll ( details );
}
export function stopPolling<T> ( details: PollingDetails<T> ) {
  details.polling = false;
}


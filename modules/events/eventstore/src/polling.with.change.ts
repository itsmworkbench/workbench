import { ErrorsAnd, hasErrors, value } from "@laoban/utils";
import { NamedLoadResult, NamedUrl, parseNamedUrlOrErrors } from "@itsmworkbench/urlstore";

export interface ResultAndNewStart {
  result: string
  newStart: number
}
export interface PollingDetails<T> {
  debug?: boolean
  pollingInterval: number
  polling: boolean
  currentPoll: string | undefined
  currentPollNamed: ErrorsAnd<NamedUrl> | undefined
  start: number
  poll: () => string //can change. When it does we start from 0 again
  load: ( poll: NamedUrl, start: number ) => Promise<ErrorsAnd<NamedLoadResult<T>>>
  errors: ( errors: string[] ) => void
  pollingCallback: ( t: T ) => void
}


export function polling<T> (
  pollingInterval: number,
  poll: () => string | undefined,
  load: ( poll: NamedUrl, start: number ) => Promise<ErrorsAnd<NamedLoadResult<T>>>,
  pollingCallback: ( t: T ) => Promise<void>,
  start: number = 0, debug?: boolean ): PollingDetails<T> {
  return {
    pollingInterval, polling: false, pollingCallback,
    start, poll, load, currentPoll: undefined, currentPollNamed: undefined,
    debug, errors: e => console.error ( e )
  }
}
async function poll<T> ( details: PollingDetails<T> ) {
  if ( !details.polling ) return; // Exit if polling has been stopped
  const newPoll = details.poll ()
  if ( newPoll !== details.currentPoll ) {
    details.start = 0
    details.currentPoll = newPoll
    details.currentPollNamed = parseNamedUrlOrErrors ( newPoll )
  }
  if ( newPoll === undefined ) return setTimeout ( () => poll ( details ), details.pollingInterval );
  if ( details.debug ) console.log ( 'polling - new poll', details )
  let currentPollNamed = details.currentPollNamed;
  if ( currentPollNamed !== undefined && hasErrors ( currentPollNamed ) ) return setTimeout ( () => poll ( details ), details.pollingInterval );
  try {
    const loaded: ErrorsAnd<NamedLoadResult<T>> = await details.load ( value ( currentPollNamed ), details.start )
    if ( hasErrors ( loaded ) ) {
      console.error ( 'polling', loaded )
      return details.errors ( loaded )
    }
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
  return poll ( details );
}
export function stopPolling<T> ( details: PollingDetails<T> ) {
  details.polling = false;
}


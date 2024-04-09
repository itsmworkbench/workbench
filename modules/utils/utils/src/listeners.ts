export function callListeners<L extends object> ( listeners: L[], call: keyof L, fn: ( l: L ) => void ) {
  for ( let l of listeners )
    if ( call in l ) {
      try {
        fn ( l )
      } catch ( e ) {
        console.error ( e )
      }
    }
}
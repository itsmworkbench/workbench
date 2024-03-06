import { Lenses, Optional } from "@focuson/lens";

export type PathToLensFn<S> = ( path: string ) => Optional<S, any>

export function pathToLens<S> (): PathToLensFn<S> {
  return path => {
    const parts = path.split ( '.' ).map ( p => p.trim () ).filter ( p => p.length > 0 )
    let lens: Optional<S, S> = Lenses.identity<S> ()
    for ( let part of parts ) {
      lens = lens.focusQuery ( part as any ) as any
    }
    return lens
  }
}

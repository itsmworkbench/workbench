import { DependentItem, dependents, DiAction, DoActionRes, EvaluateDiFn, EvaluateDiRes, isWhenChangeDefault, load } from "./dependent.data";
import { flatMap } from "@laoban/utils";
import { DiHash, DiHashCache, diHashChanged, getOrUpdateFromCache } from "./hash";


export const evaluateDis = <S> ( currentHash: ( name: string ) => DiHash ): EvaluateDiFn<S> =>
  ( dis: DependentItem<S, any>[], ) => {
    const hashCache: DiHashCache = {}
    return ( s: S ): EvaluateDiRes<S> => {
      const actions: DiAction<S>[] = flatMap ( dis, di => {
        const deps = dependents ( di.dependsOn )
        const theseHashes = deps.map ( d => getOrUpdateFromCache ( hashCache, d.name,
          () => {
            const value = d.hashFn ( di.optional.getOption ( s ) );
            const hash = d.hashFn ( value );
            return { value, hash };
          } ) )
        const someUpstreamIsUndefined = theseHashes.some ( h => h.value === undefined )
        if ( someUpstreamIsUndefined ) return []//Can't load if an upstream is not present

        const curValue = di.optional.getOption ( s )
        if ( curValue === undefined ) {
          return [ { type: 'leave', params: [], di } ]
        }
        const currentHashes = deps.map ( d => currentHash ( d.name ) )
        const changed = currentHashes.some ( ( ch, i ) => diHashChanged ( ch, theseHashes[ i ].hash ) )
        if ( changed ) {
          const params = deps.map ( d => hashCache[ d.name ].value );
          return [ { type: di.whenUpstreamChanges, params, di } ]
        }
        return []
      } );
      return {actions, hashCache}
    };
  }

export function calculateNewS<S> ( dis: DiAction<S>[], s: S ) {
  const newS = dis.reduce ( ( acc, a ) => {
    let newAcc = acc
    if ( a.type === 'nuke' ) newAcc = a.di.optional.set ( acc, undefined as any )
    if ( isWhenChangeDefault ( a.type ) ) a.di.optional.set ( acc, a.type () as any )
    return newAcc === undefined ? acc : newAcc;
  }, s )
  return newS;
}
export function calculateUpdates<S> ( dis: DiAction<S>[] ) {
  return dis.map ( async dia => {
    const t: any = await load ( dia.di.dependsOn, dia.params )
    return ( s: S ) => dia.di.optional.set ( s, t )
  } );
}
export function doActions<S> ( dis: DiAction<S>[] ) {
  return ( s: S ): DoActionRes<S> => ({
    newS: calculateNewS ( dis, s ),
    updates: calculateUpdates ( dis )
  })
}
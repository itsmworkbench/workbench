import { NameAnd } from "@laoban/utils";

export type DiHash = undefined | string | string[]
export type DiHashFn<T> = ( t: T ) => DiHash

export function hashToString ( h: DiHash ): string {
  if ( h === undefined ) return 'undefined'
  if ( typeof h === 'string' ) return h
  return JSON.stringify ( h )
}
export const stringHashFn: DiHashFn<string> = ( s: string ) => s;
export const stringArrayHashFn: DiHashFn<string[]> = ( s: string[] ) => s;
export const nameAndStringHashFn = ( names: string[] ): DiHashFn<NameAnd<string>> => ( na: NameAnd<string> ) => names.map ( n => na[ n ] )

export function diHashChanged ( oldValue: DiHash, newValue: DiHash ) {
  if ( oldValue === undefined ) return newValue !== undefined
  const t1 = typeof oldValue
  if ( t1 !== typeof newValue ) return true
  if ( t1 === 'string' ) return newValue !== oldValue
  const oldVA: string[] = oldValue as string[]
  const newVA: string[] = newValue as string[]
  if ( oldVA.length !== newVA.length ) return true
  for ( let i = 0; i < oldVA.length; i++ )
    if ( oldVA[ i ] !== newVA[ i ] ) return true
  return false;
}

export type SavedDiAndHash<T> = {
  value: T
  hash: DiHash
}

export type DiHashCache = NameAnd<SavedDiAndHash<any>>

export function getOrUpdateFromCache<T> ( cache: DiHashCache, name: string, raw: () => SavedDiAndHash<T> ): SavedDiAndHash<T> {
  const saved = cache[ name ]
  if ( saved ) return saved
  const newSaved = raw ()
  cache[ name ] = newSaved
  return newSaved
}

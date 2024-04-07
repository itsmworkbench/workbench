import { NameAnd } from "@laoban/utils";

export type TwoKeyPromiseCache<T> = NameAnd<NameAnd<Promise<T>>>

export function getOrUpdateFromPromiseCache<T> ( cache: TwoKeyPromiseCache<T>, name1: string, name2: string, raw: () => Promise<T> ): Promise<T> {
  const thisCache: NameAnd<Promise<T>> = cache[ name1 ] || {}
  const saved = thisCache[ name2 ]
  if ( saved ) return saved
  const result = raw ().finally ( () => {delete thisCache[ name2 ]} ) //timing... because of single threading this can't happen until after the next few lines
  thisCache[ name2 ] = result
  cache[ name1 ] = thisCache
  return result
}
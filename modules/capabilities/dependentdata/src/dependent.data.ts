import { Optional } from "@focuson/lens";
import { DiHash, DiHashCache, DiHashFn } from "./hash";
import { NameAnd } from "@laoban/utils";

export type RootDepend<T> = {
  root: true
  load?: () => Promise<T>
}
function isRootDepend<S, T> ( d: DependsOn<S, T> ): d is RootDepend<T> {
  return 'root' in d
}

export type DependsOn1<S, T, T1> = {
  dependentOn: DependentItem<S, T1>
  load?: ( p1: T1 ) => Promise<T>
}
function isDependsOn1<S, T, T1> ( d: DependsOn<S, T> ): d is DependsOn1<S, T, T1> {
  return 'dependentOn' in d
}
export type DependsOn2<S, T, T1, T2> = {
  dependentOn1: DependentItem<S, T1>
  dependentOn2: DependentItem<S, T2>
  load?: ( p1: T1, p2: T2 ) => Promise<T>
}
function isDependsOn2<S, T, T1, T2> ( d: DependsOn<S, T> ): d is DependsOn2<S, T, any, any> {
  return 'dependentOn1' in d && 'dependentOn2' in d
}
export type DependsOn3<S, T, T1, T2, T3> = {
  dependentOn1: DependentItem<S, T1>
  dependentOn2: DependentItem<S, T2>
  dependentOn3: DependentItem<S, T3>
  load?: ( p1: T1, p2: T2, p: T3 ) => Promise<T>
}
function isDependsOn3<S, T, T1, T2, T3> ( d: DependsOn<S, T> ): d is DependsOn3<S, T, any, any, any> {
  return 'dependentOn3' in d && 'dependentOn2' in d && 'dependentOn1' in d
}
export type DependsOn<S, T> = DependsOn1<S, T, any> | DependsOn2<S, T, any, any> | DependsOn3<S, T, any, any, any> | RootDepend<T>
export function dependents<S, T> ( d: DependsOn<S, T> ): DependentItem<S, any>[] {
  if ( isDependsOn3<S, T, any, any, any> ( d ) ) return [ d.dependentOn1, d.dependentOn2, d.dependentOn3 ]
  if ( isDependsOn2<S, T, any, any> ( d ) ) return [ d.dependentOn1, d.dependentOn2 ]
  if ( isDependsOn1<S, T, any> ( d ) ) return [ d.dependentOn ]
  if ( isRootDepend<S, T> ( d ) ) return []
  throw new Error ( 'Unknown depends' + JSON.stringify ( d ) )
}
export function load<S, T> ( d: DependsOn<S, T>, params: any[] ): Promise<T> | undefined {
  if ( isDependsOn3<S, T, any, any, any> ( d ) ) return d.load !== undefined && d.load ( params[ 0 ], params[ 1 ], params[ 2 ] )
  if ( isDependsOn2<S, T, any, any> ( d ) ) return d.load !== undefined && d.load ( params[ 0 ], params[ 1 ] )
  if ( isDependsOn1<S, T, any> ( d ) ) return d.load !== undefined && d.load ( params[ 0 ] )
  if ( isRootDepend<S, T> ( d ) ) return d.load !== undefined && d.load ()
  throw new Error ( 'Unknown depends' + JSON.stringify ( d ) )
}

export type WhenChangeActionString = 'nuke' | 'leave'
export type WhenChangeDefault<T> = () => T
export function isWhenChangeDefault<T> ( w: WhenChangeAction<T> ): w is WhenChangeDefault<T> {
  return typeof w === 'function'
}
export type WhenChangeAction<T> = WhenChangeActionString | WhenChangeDefault<T>

export interface DependentItem<S, T> {
  name: string
  hashFn: DiHashFn<T>
  optional: Optional<S, T>
  dependsOn: DependsOn<S, T>
  whenUpstreamChanges?: WhenChangeAction<T>
}

export interface DiAction<S> {
  type: WhenChangeAction<any>
  params: any[] // the found params that we will pass to the load fn
  di: DependentItem<S, any>
}

export type EvaluateDiRes<S> = {
  actions: DiAction<S>[]
  hashCache: DiHashCache
}


export type EvaluateDiFn<S> = ( dis: DependentItem<S, any>[] ) => ( s: S ) => EvaluateDiRes<S>
export type DoActionsFn<S> = ( dis: DiAction<S>[] ) => ( s: S ) => DoActionRes<S>
export type DoActionRes<S> = {
  newS: S // has all the nuked or defaulted values. The ones we know 'now'
  updates: Promise<( s: S ) => S>[] // all the things that will be done in the future
}
export interface DependentEngine<S> {
  //the s here is used to get the parameters
  evaluate: EvaluateDiFn<S>
  //Getting this signature right is hard. This one lets us use the actions in most access patterns
  //Note the s here is probably different to the s above because of time
  doActions: DoActionsFn<S>
}


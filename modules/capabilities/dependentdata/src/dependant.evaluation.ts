import { NameAnd } from "@laoban/utils";
import { diTagChanged, ValueAndTagAndLastTag } from "./tag";
import { TagStoreGetter } from "./tag.store";
import { cleanValue, DependentItem, dependents, loadFn } from "./dependent.data";
import { DiAction } from "./di.actions";

export type EvaluateDiFn<S> = ( dis: DependentItem<S, any>[] ) => ( s: S ) => EvaluateDiRes<S>
export type EvaluateDiRes<S> = {
  actions: DiAction<S, any>[]
  status: UpstreamStatus
  vAndT: DiValuesAndTags
}

//true means it's dirty and in need of change, false means it's not changed, undefined means 'the upstream value is undefined'
export type UpstreamStatus = NameAnd<boolean | undefined>
export type DiValuesAndTags = NameAnd<ValueAndTagAndLastTag>

function makeDiAction<S, T> ( deps: DependentItem<S, any>[], vAndT: NameAnd<ValueAndTagAndLastTag>, di: DependentItem<S, T>, s: S, wantLoad: boolean, currentTags: ValueAndTagAndLastTag[], reasonPrefix ): DiAction<S, T>[] {
  const params = deps.map ( d => vAndT[ d.name ].value );
  const value = cleanValue ( di, s, params )
  const tag = di.tagFn ( value )
  const clean = { value, tag }
  const alreadyClean = clean.value === vAndT[ di.name ].value || clean.tag === vAndT[ di.name ].tag//Note the || We're OK if we have already cleaned. We can use the value (often a string or something) or the tag
  const load = wantLoad && di.dependsOn.load ? loadFn ( di.dependsOn, params ) : undefined
  if ( load ) return [ { clean, load, di, tags: currentTags, tag: vAndT[ di.name ].tag, reason: reasonPrefix + 'HaveLoadFn' } ]; // if we need to load then we need an action
  return alreadyClean ? [] : [ { clean, di, reason: reasonPrefix + 'NoLoadFnButNeedToClean' } ] // if we need to clean then we need an action
}
export const evaluateDependentItem = <S> ( getTag: TagStoreGetter<S>, status: UpstreamStatus, vAndT: DiValuesAndTags, s: S ) => ( di: DependentItem<S, any> ): DiAction<S, any>[] => {
  const deps = dependents ( di.dependsOn )
  const currentTags = deps.map ( d => vAndT[ d.name ] )
  const someUpstreamIsUndefined = currentTags.some ( vt => vt?.value === undefined )
  const lastTags = currentTags.map ( vAndT => vAndT.lastTag )
  const upstreamChanged = lastTags.some ( ( ch, i ) => diTagChanged ( ch, currentTags[ i ].tag ) )

  const thisValue = di.optional.getOption ( s )
  const thisTag = di.tagFn ( thisValue )
  vAndT[ di.name ] = { value: thisValue, tag: thisTag, lastTag: getTag ( s, di.name ) }

  const willClean = thisTag === undefined || upstreamChanged || someUpstreamIsUndefined;
  const reasonPrefix = thisTag === undefined ? 'thisTagUndefined' : upstreamChanged ? 'upStreamChanged' : someUpstreamIsUndefined ? 'someUpstreamIsUndefined' : 'noChange'
  status[ di.name ] = thisValue === undefined ? undefined : willClean


  return willClean ? makeDiAction ( deps, vAndT, di, s, !someUpstreamIsUndefined, currentTags, reasonPrefix ) : [];
};

export const evaluateAllDependentItems = <S> ( getTag: TagStoreGetter<S> ): EvaluateDiFn<S> => ( dis: DependentItem<S, any>[] ) => ( s: S ): EvaluateDiRes<S> => {
  const status: UpstreamStatus = {}
  const vAndT: DiValuesAndTags = {}
  const actions = dis.flatMap ( evaluateDependentItem ( getTag, status, vAndT, s ) )
  return { actions, status, vAndT }
};
import { collect, errors, ErrorsAnd, hasErrors, mapErrorsK, mapK, mapObjectValues, NameAnd, value } from "@laoban/utils";
import { addLogToExecutable, Executable, execute, executeAgentNeedDefined } from "./executable";


export type QueryAnd<Q, R> = { query: Q, result: R }
export type Who={who:string[]}


export interface QueryDefn<Context, Query, Intent, WorkResult, Result> {
  intent: Executable<Context, Query, Intent>
  who: Executable<Context, QueryAnd<Query, Intent>, Who>
  workers: NameAnd<Executable<Context, Query, WorkResult>>
  composeResult: Executable<Context, QueryAnd<Query, WorkResult[]>, Result>
}

export type QueryListener<C, Q, I, WR, R> = {
  start: ( c: C, q: Q ) => void
  processErrors: ( stage: string, es: string[] ) => void
  intent: ( c: C, q: Q, i: I ) => void
  who: ( c: C, q: QueryAnd<Q, I>, w: Who ) => void
  workerResult: ( c: C, q: Q, w: WR ) => void
  result: ( c: C, q: QueryAnd<Q, WR[]>, r: R ) => void
}

export function addLogToQueryDefn<Context, Query, Intent, WorkResult, Result> ( qd: QueryDefn<Context, Query, Intent, WorkResult, Result>, ql: QueryListener<Context, Query, Intent, WorkResult, Result> ): QueryDefn<Context, Query, Intent, WorkResult, Result> {
  return {
    intent: addLogToExecutable ( qd.intent, ql.intent ),
    who: addLogToExecutable ( qd.who, ql.who ),
    workers: mapObjectValues ( qd.workers, worker => addLogToExecutable ( worker, ql.workerResult ) ),
    composeResult: addLogToExecutable ( qd.composeResult, ql.result )
  }
}

export const getNamed = <T> ( ns: NameAnd<T> ) =>
  ( names: string[] ): T[] =>
    names.map ( name => ns[ name ] ).filter ( n => n !== undefined );

function processErrors<T> ( e: ErrorsAnd<T>[], p: ( errors: string[] ) => void ): T[] {
  const allErrors = collect ( e, hasErrors, errors ).flat ()
  if ( allErrors.length > 0 ) p ( allErrors )
  return collect ( e, r => r !== undefined && !hasErrors ( r ), value )
}

export const executeQuery = async <C, Q, I, WR, R> ( qd: QueryDefn<C, Q, I, WR, R>, c: C, ql: QueryListener<C, Q, I, WR, R> ) => {
  const loggedQd = addLogToQueryDefn ( qd, ql )
  return async ( query: Q ): Promise<ErrorsAnd<R>> => {
    ql.start ( c, query )
    return mapErrorsK ( await executeAgentNeedDefined ( 'Error calculating intent', loggedQd.intent, c, query ),
      async intent => mapErrorsK ( await executeAgentNeedDefined ( 'Error calculating who', loggedQd.who, c, { query, result: intent } ),
        async who => {
          const workers: Executable<C, Q, WR>[] = getNamed ( loggedQd.workers ) ( who.who );
          const raw: ErrorsAnd<WR>[] = await mapK ( workers, w => execute ( w, c, query ) )
          const result = processErrors ( raw, es => ql.processErrors ( 'workerResults', es ) )
          return execute ( loggedQd.composeResult, c, { query, result } )
        } ) )
  };
};

export function describeQueryDefn<C, Q, I, WR, R> ( q: QueryDefn<C, Q, I, WR, R>, c: C, query: Q ) {
  const display = ( e: Executable<any, any, any> ) => `${e.name}:${e.description}`;
  return {
    intent: display ( q.intent ),
    who: display ( q.who ),
    workers: Object.entries ( q.workers ).map ( ( [ name, worker ] ) => `${name}:${display ( worker )}` ),
    composeResult: display ( q.composeResult )
  }
}
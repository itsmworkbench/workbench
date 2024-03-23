import { ErrorsAnd, NameAnd } from "@laoban/utils";

export type SqlQueryResult = { cols: string[], rows: NameAnd<string>[] }
export function isSqlQueryResult ( t: any ): t is SqlQueryResult {
  console.log ( 'isSqlQueryResult', typeof t, t )
  console.log ( 'isSqlQueryResult', 'cols', t?.cols, 'row', t?.rows )
  return t?.cols && t?.rows
}

export type SqlQueryFn = ( sql: string[], env: string ) => Promise<ErrorsAnd<SqlQueryResult>>; // we just display and store it. Almost certainly we will revisit this
export type SqlUpdateFn = ( sql: string[], env: string ) => Promise<ErrorsAnd<number>>;
export type SqlTestFn = ( env: string ) => Promise<ErrorsAnd<string>>;

//environementname and then some attribute values about that environemnt
export type SqlEnvsFn = (  ) => Promise<ErrorsAnd<NameAnd<NameAnd<string>>>>;

export type Sqler = {
  query: SqlQueryFn,
  update: SqlUpdateFn,
  test: SqlTestFn
  listEnvs: SqlEnvsFn
}
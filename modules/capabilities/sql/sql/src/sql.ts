import { ErrorsAnd, NameAnd } from "@laoban/utils";

export type SqlQueryResult = { rows: string[], cols: NameAnd<string>[] }

export type SqlQueryFn = ( sql: string[], env: string ) => Promise<ErrorsAnd<SqlQueryResult>>; // we just display and store it. Almost certainly we will revisit this
export type SqlUpdateFn = ( sql: string[], env: string ) => Promise<ErrorsAnd<number>>;
export type SqlTestFn = (env: string) => Promise<ErrorsAnd<string>>;

export type Sqler = {
  query: SqlQueryFn,
  update: SqlUpdateFn,
  test: SqlTestFn
}
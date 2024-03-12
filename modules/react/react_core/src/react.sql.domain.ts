export interface RawSqlWorkbenchState {
  sql: string
  response: string
}
export function isRawSqlWorkbenchState ( state: SqlWorkbenchState ): state is RawSqlWorkbenchState {
  return (state as any).purpose === undefined
}
export interface ActionSqlWorkbenchState {
  sql: string
  response: string
  purpose: string
  actionName?: string
}
export function isActionSqlWorkbenchState ( state: SqlWorkbenchState ): state is ActionSqlWorkbenchState {
  return (state as ActionSqlWorkbenchState).purpose !== undefined
}

export type SqlWorkbenchState = RawSqlWorkbenchState | ActionSqlWorkbenchState


export interface HasSqlWorkbenchState {
  sqlWorkbench: SqlWorkbenchState
}

export interface SqlPrefiledDetails {
  variables: any
  sql?: string
  type?: string
  correctWhen?: string
  title?: string
  actionName?: string
}

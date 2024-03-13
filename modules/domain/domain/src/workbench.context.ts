export type WhereContext = { phase?: string, action?: string, tab?: string }
export type DisplayContext = { title: string, type: string, successOrFail: boolean }

export type WorkBenchContext<T> = {
  where: WhereContext
  data: T
  display: DisplayContext

}
export type SqlWorkBenchContext = WorkBenchContext<SqlData>
export interface SqlData {
  sql: string
  response: string
}

export type LdapWorkBenchContext = WorkBenchContext<LdapData>
export interface LdapData {
  email: string
  response: string
}
export interface EmailTempData {
  to: string
  subject: string
  email: string
}
export type EmailWorkBenchContext = WorkBenchContext<EmailTempData>
export interface ReceiveEmailData {
  from: string
  email: string
}

export type ReceiveEmailWorkbenchContext = WorkBenchContext<ReceiveEmailData>
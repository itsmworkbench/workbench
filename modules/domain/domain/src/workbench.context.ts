import { Capability } from "./capabilities";
import { ErrorsAnd, NameAnd } from "@laoban/utils";
import { IdentityUrl } from "@itsmworkbench/urlstore";
import { SqlQueryResult } from "@itsmworkbench/sql";
import { EmailSummary, ListEmailsResult } from "@itsmworkbench/fetchemail";

export type WhereContext = { phase?: string, action?: string, tab?: string }
export type DisplayContext = { title: string, type: string, successOrFail: boolean | undefined }

export type WorkBenchContext<T> = {
  capability: Capability
  where: WhereContext
  data: T
  display: DisplayContext
}
export function isWhereContext ( context: any ): context is WhereContext {
  return context?.phase || context?.action || context?.tab
}
export function isDisplayContext ( context: any ): context is DisplayContext {
  return context?.title && context?.type && context?.successOrFail
}
export function isWorkBenchContext<T> ( context: any ): context is WorkBenchContext<T> {
  return context?.capability && isWhereContext ( context.where ) && isDisplayContext ( context.display )
}
export interface SqlWorkBenchContext extends WorkBenchContext<SqlData> {
  capability: 'SQL'
}
export function isSqlWorkBenchContext ( context: any ): context is SqlWorkBenchContext {
  return isWorkBenchContext<SqlData> ( context ) && context.capability === 'SQL'
}
export interface SqlData {
  env: string
  sql: string
  response: ErrorsAnd<SqlQueryResult>
}

export interface LdapWorkBenchContext extends WorkBenchContext<LdapData> {
  capability: 'LDAP'
}
export function isLdapWorkBenchContext ( context: any ): context is LdapWorkBenchContext {
  return isWorkBenchContext<LdapData> ( context ) && context.capability === 'LDAP'
}
export interface LdapData {
  who: string
  response: string
}
export interface EmailWorkBenchContext extends WorkBenchContext<EmailTempData> {
  capability: 'Email'
}
export function isEmailWorkBenchContext ( context: any ): context is EmailWorkBenchContext {
  return isWorkBenchContext<EmailTempData> ( context ) && context.capability === 'Email'
}
export interface EmailTempData {
  to: string
  subject: string
  email: string
  response?: string
}
export interface ReceiveEmailWorkbenchContext extends WorkBenchContext<ReceiveEmailData> {
  capability: 'ReceiveEmail'
}
export function isReceiveEmailWorkbenchContext ( context: any ): context is ReceiveEmailWorkbenchContext {
  return isWorkBenchContext<ReceiveEmailData> ( context ) && context.capability === 'ReceiveEmail'
}
export interface ReceiveEmailData {
  from: string
  emailSummary: ErrorsAnd<ListEmailsResult>
  email: string
}


export interface ReviewTicketWorkBenchContext extends WorkBenchContext<ReviewTicketData> {
  capability: 'ReviewTicket'
}

export function isReviewTicketWorkBenchContext ( context: any ): context is ReviewTicketWorkBenchContext {
  return isWorkBenchContext<ReviewTicketData> ( context ) && context.capability === 'ReviewTicket'
}
export interface ReviewTicketData {
  attributes: NameAnd<string>
}

export type SelectKnowledgeArticleWorkBenchContext = WorkBenchContext<SelectKnowledgeArticleData>
export function isSelectKnowledgeArticleWorkBenchContext ( context: any ): context is SelectKnowledgeArticleWorkBenchContext {
  return isWorkBenchContext<SelectKnowledgeArticleData> ( context ) && context.capability === 'SelectKnowledgeArticle'
}
export interface SelectKnowledgeArticleData {
  ticketType: any //should be ticket type but need to move around
  id?: IdentityUrl
}
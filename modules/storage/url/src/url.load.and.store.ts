import { ErrorsAnd, mapErrorsK } from "@laoban/utils";
import { IdentityUrl, isIdentityUrl, isNamedUrl, NamedOrIdentityUrl, NamedUrl, parseUrl } from "./identity.and.name.url";

export type IdentityUrlLoadResult<T> = {
  url: string
  mimeType: string
  result: T  //the result should be in line with the mimeType
  id: string //The id is something like itsmid:org:namespace:id. Note that if this is a identity url then the id should be the same as the url
}
export type NamedLoadResult<T> = IdentityUrlLoadResult<T> & { fileSize: number }
export function isIdentityUrlLoadResult<T> ( x: any ): x is IdentityUrlLoadResult<T> {
  return typeof x.url === 'string' && typeof x.mimeType === 'string' && typeof x.result === 'object' && typeof x.id === 'string'
}
export function isNamedLoadResult<T> ( x: any ): x is NamedLoadResult<T> {
  return isIdentityUrlLoadResult<T> ( x ) && 'fileSize' in x
}
export type UrlLoadNamedFn = <T>( url: NamedUrl, offset?: number ) => Promise<ErrorsAnd<NamedLoadResult<T>>>
export type UrlLoadIdentityFn = <T>( url: IdentityUrl ) => Promise<ErrorsAnd<IdentityUrlLoadResult<T>>>

export type UrlStoreResult = {
  url: string
  fileSize: number
  id: string
}
export function isUrlStoreResult ( x: any ): x is UrlStoreResult {
  return typeof x.url === 'string' && typeof x.fileSize === 'number' && typeof x.id === 'string'
}

export type UrlSaveFn = ( url: NamedOrIdentityUrl, content: any ) => Promise<ErrorsAnd<UrlStoreResult>>

export type PageQuery = {
  page: number
  pageSize?: number
}

export function applyPaging<T> ( raw: T[], query: PageQuery ): T[] {
  const start = (query.page - 1) * query.pageSize;
  const end = start + query.pageSize;
  return raw.slice ( start, end );
}
export type ListNamesResult = PageQuery & {
  org: string
  namespace: string
  names: string[]
  page: number
  total: number
}
export type ListNamesOrder = 'name' | 'date'

export type UrlListFn = ( org: string, namespace: string, query: PageQuery, order: ListNamesOrder ) => Promise<ErrorsAnd<ListNamesResult>>

export type UrlLoaders = {
  loadNamed: UrlLoadNamedFn
  loadIdentity: UrlLoadIdentityFn
}
export type UrlStore = UrlLoaders & {
  save: UrlSaveFn
  list: UrlListFn
}

export function loadFromString<T> ( urlLoaders: UrlLoaders, url: string, offset?: number ): Promise<ErrorsAnd<IdentityUrlLoadResult<T>>> {
  return mapErrorsK ( parseUrl ( url ), async parsedUrl => {
    if ( isIdentityUrl ( parsedUrl ) ) return urlLoaders.loadIdentity ( parsedUrl )
    if ( isNamedUrl ( parsedUrl ) ) return urlLoaders.loadNamed ( parsedUrl, offset )
    return [ `Invalid url. It is neither a named url nor an identity url ${parsedUrl}` ]
  } )
}
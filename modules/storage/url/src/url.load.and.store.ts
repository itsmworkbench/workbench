import { ErrorsAnd } from "@laoban/utils";

export type UrlLoadResult<T> = {
  url: string
  mimeType: string
  result: T  //the result should be in line with the mimeType
  fileSize: number //If you ask again for 'appends' this is the start point
  id: string //The id is something like itsmid:org:namespace:id. Note that if this is a identity url then the id should be the same as the url
}
export function isUrlLoadResult<T> ( x: any ): x is UrlLoadResult<T> {
  return typeof x.url === 'string' && typeof x.mimeType === 'string' && typeof x.result === 'object' && typeof x.fileSize === 'number' && typeof x.id === 'string'
}
export type UrlLoadFn = <T>( url: string ) => Promise<ErrorsAnd<UrlLoadResult<T>>>

export type UrlStoreResult = {
  url: string
  fileSize: number
  id: string
}
export function isUrlStoreResult ( x: any ): x is UrlStoreResult {
  return typeof x.url === 'string' && typeof x.fileSize === 'number' && typeof x.id === 'string'
}

export type UrlSaveFn = ( url: string, content: any ) => Promise<ErrorsAnd<UrlStoreResult>>

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

export type UrlListFn = ( org: string, namespace: string, query: PageQuery , order: ListNamesOrder) => Promise<ErrorsAnd<ListNamesResult>>

export type UrlStore = {
  load: UrlLoadFn
  save: UrlSaveFn
  list: UrlListFn
}
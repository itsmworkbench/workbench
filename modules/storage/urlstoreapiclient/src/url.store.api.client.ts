import { ErrorsAnd, hasErrors, mapErrorsK, NameAnd } from "@laoban/utils";
import { HasNamespace, IdentityUrl, IdentityUrlLoadResult, isIdentityUrlLoadResult, isListNamesResult, isNamedLoadResult, isUrlStoreResult, ListNamesOrder, ListNamesResult, NamedLoadResult, NamedOrIdentityUrl, NamedUrl, NameSpaceDetails, PageQuery, UrlListFn, UrlLoadIdentityFn, UrlLoadNamedFn, UrlSaveFn, UrlSaveOptions, UrlStore, UrlStoreResult, urlToDetails, writeUrl } from "@itsmworkbench/url";

export type UrlStoreApiClientConfig = {
  apiUrlPrefix: string // we place our url at the end of this
  details: NameAnd<NameSpaceDetails>
  debug?: boolean
}

export function baseFetch ( config: UrlStoreApiClientConfig, fullUrl: string, namedOrIdentity: HasNamespace, init?: RequestInit ): Promise<ErrorsAnd<any>> {
  return mapErrorsK ( urlToDetails ( config.details, namedOrIdentity ), async details => {//This is 'just' error checking//validation
    try {
      const response = await fetch ( fullUrl, init )
      if ( response.status < 400 ) return await response.json ();
      return [ `Failed to fetch ${fullUrl}. Init is ${JSON.stringify ( init || {} )}. Status ${response.status}\n${await response.text ()}` ]
    } catch ( e ) {return [ `Failed to fetch ${fullUrl}. Init is ${JSON.stringify ( init || {} )}\n${JSON.stringify ( e )}` ] }
  } )

}
export function loadNamedFromApi ( config: UrlStoreApiClientConfig ): UrlLoadNamedFn {
  return async <T> ( named: NamedUrl, offset?: number ): Promise<ErrorsAnd<NamedLoadResult<T>>> => {
    const baseUrl = `${config.apiUrlPrefix}/${(writeUrl ( named ))}`
    const fullUrl = offset ? `${baseUrl}?offset=${offset}` : baseUrl
    return mapErrorsK ( await baseFetch ( config, fullUrl, named ), async rawResponse => {
      if ( isNamedLoadResult<T> ( rawResponse ) ) return rawResponse;
      return [ `Failed to load ${named.url}. Expected NamedLoadResult. ${JSON.stringify ( rawResponse )}` ]


    } )
  }
}
export function loadIdentityFromApi ( config: UrlStoreApiClientConfig ): UrlLoadIdentityFn {
  return async <T> ( identity: IdentityUrl ): Promise<ErrorsAnd<IdentityUrlLoadResult<T>>> =>
    mapErrorsK ( await baseFetch ( config, `${config.apiUrlPrefix}/${(writeUrl ( identity ))}`, identity ), async rawResponse => {
      if ( hasErrors ( rawResponse ) ) return rawResponse;
      if ( isIdentityUrlLoadResult<T> ( rawResponse ) ) return rawResponse;
      return [ `Failed to load ${identity.url}. Expected IdentityUrlLoadResult. ${JSON.stringify ( rawResponse )}` ]
    } )
}

export const saveToApi = ( config: UrlStoreApiClientConfig ): UrlSaveFn =>
  async ( namedOrIdentityUrl: NamedOrIdentityUrl, content: any, options?: UrlSaveOptions ): Promise<ErrorsAnd<UrlStoreResult>> => {
    return mapErrorsK ( urlToDetails ( config.details, namedOrIdentityUrl ), async details => {
      return mapErrorsK ( details.writer ( content ), async body => {
        const optionsAsQuery = options ? `?${Object.entries ( options ).map ( ( [ k, v ] ) => `${k}=${v}` ).join ( '&' )}` : ''
        const fullUrl = `${config.apiUrlPrefix}/${writeUrl ( namedOrIdentityUrl )}${optionsAsQuery}`
        const rawResponse = await baseFetch ( config, fullUrl, namedOrIdentityUrl, {
          method: 'PUT',
          body,
          headers: { 'Content-Type': details.mimeType }
        } );
        if ( isUrlStoreResult ( rawResponse ) ) return rawResponse;
        return [ `Failed to save ${JSON.stringify ( namedOrIdentityUrl )}. Expected UrlStoreResult. ${JSON.stringify ( rawResponse )}` ]
      } )
    } )
  }

export const listFromApi = ( config: UrlStoreApiClientConfig ): UrlListFn =>
  async ( { org, namespace, pageQuery, order, filter } ): Promise<ErrorsAnd<ListNamesResult>> => {
    const filterStr = filter ? `&filter=${filter}` : ''
    const fullUrl = `${config.apiUrlPrefix}/list/${org}/${namespace}?page=${pageQuery.page}&pageSize=${pageQuery.pageSize}&order=${order}${filterStr}`
    const rawResponse = await baseFetch ( config, fullUrl, { namespace }, );
    if ( isListNamesResult ( rawResponse ) ) return rawResponse;
    return [ `Failed to list ${org} ${namespace}. Expected ListNamesResult. ${JSON.stringify ( rawResponse )}` ]
  }

export function urlStoreFromApi ( config: UrlStoreApiClientConfig ): UrlStore {
  return {
    loadNamed: loadNamedFromApi ( config ),
    loadIdentity: loadIdentityFromApi ( config ),
    save: saveToApi ( config ),
    list: listFromApi ( config )
  }
}
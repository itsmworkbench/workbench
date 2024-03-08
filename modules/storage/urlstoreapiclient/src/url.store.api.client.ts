import { ErrorsAnd, hasErrors, mapErrorsK, NameAnd } from "@laoban/utils";
import { isUrlLoadResult, isUrlStoreResult, NameSpaceDetails, parseUrl, UrlLoadFn, UrlLoadResult, UrlSaveFn, UrlStoreResult, urlToDetails } from "@itsmworkbench/url";

export type UrlStoreApiClientConfig = {
  apiUrlPrefix: string // we place our url at the end of this
  details: NameAnd<NameSpaceDetails>
}

export const loadFromApi = ( config: UrlStoreApiClientConfig ): UrlLoadFn => async <T> ( urlAsString: string, offset?: number ): Promise<ErrorsAnd<UrlLoadResult<T>>> =>
  mapErrorsK ( parseUrl ( urlAsString ), async _ => {//This is just error checking//validation
    try {
      const base = `${config.apiUrlPrefix}/${encodeURIComponent ( urlAsString )}`
      const fullUrl = offset ? `${base}?offset=${offset}` : base
      const response = await fetch ( fullUrl )
      if ( response.status < 400 ) {
        let result: any = await response.json ();
        if ( isUrlLoadResult<T> ( result ) ) return result
        return [ `Failed to load ${urlAsString}. Expected a UrlLoadResult but got ${JSON.stringify ( result )}` ]
      } // this should be UrlLoadResult
      return [ `Failed to load ${urlAsString}. Status ${response.status}\n${await response.text ()}` ]
    } catch ( e ) {return [ `Failed to load ${urlAsString}`, e ] }
  } );

export const saveToApi = ( config: UrlStoreApiClientConfig ): UrlSaveFn => async ( urlAsString: string, content: any ): Promise<ErrorsAnd<UrlStoreResult>> => {
  return mapErrorsK ( parseUrl ( urlAsString ), async namedOrIdentityUrl =>
    mapErrorsK ( urlToDetails ( config.details, namedOrIdentityUrl ), async details => {
        {
          try {
            const fullUrl = `${config.apiUrlPrefix}/${encodeURIComponent ( urlAsString )}`
            let body = details.writer ( content );
            if ( hasErrors ( body ) ) return body
            console.log ( 'saveToApi url', namedOrIdentityUrl )
            console.log ( 'saveToApi content', content )
            console.log ( 'saveToApi body', body )
            const response = await fetch ( fullUrl, {
              method: 'PUT',
              body,
              headers: {
                'Content-Type': details.mimeType
              }
            } )
            if ( response.status < 400 ) {
              const result = await response.json ()
              if ( isUrlStoreResult ( result ) ) return result
              return [ `Failed to save ${urlAsString}. Expected a UrlStoreResult but got ${JSON.stringify ( result )}` ]
            }
            return [ `Failed to save ${urlAsString}. Status ${response.status}\n${await response.text ()}` ]
          } catch
            ( e ) {return [ `Failed to save ${urlAsString}`, e ] }
        }
      }
    ) )
}

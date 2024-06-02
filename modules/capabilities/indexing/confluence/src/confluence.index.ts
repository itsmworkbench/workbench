import { ExecuteIndexOptions, fetchArrayWithPaging, FetchArrayWithPagingType, FetchFn, fetchOneItem, Indexer, IndexingContext, IndexTreeNonFunctionals, PagingTc, SourceSinkDetails } from "@itsmworkbench/indexing";
import { withRetry, withThrottle } from "@itsmworkbench/kleislis";

export interface ConfluenceDetails extends SourceSinkDetails {
  index: string;
  aclIndex: string;
  file: string;
  spaces?: string[]
  maxSpaces?: number; // for testing.
  maxPages?: number; // for testing.

}

export type ConfluencePaging = {
  next?: string
}
export function prefixWithUrl ( url: string, next: string ) {
  const parsedUrl = new URL ( url );
  return `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''}${next}`;
}
export const ConfluencePagingTC: PagingTc<ConfluencePaging> = {
  zero: () => ({}),
  hasMore: ( p ) => p.next !== undefined,
  logMsg: ( p ) => p.next !== undefined ? `Next page ${p.next}` : 'No more pages',
  url: ( baseUrl, p ) => p.next ? prefixWithUrl ( baseUrl, p.next ) : baseUrl,
  fromResponse: ( data, _ ) =>
    ({ data, page: { next: data?._links?.next } })
}
export type ConfluenceSpace = {
  id: string
  key: string
  _links: { self: string }
}
export type ConfluencePageSummary = {
  id: string
  content: { _links: { self: string } }
}
export type ConfluencePage = {
  id: string
  body: { view: { value: string } }
  space: { key: string }
  title: string
  status: string
  history: ConfluenceHistory
  version: { when: string, by: ConfluencePerson }
}
export type ConfluencePerson = { username: string, displayName: string }
export type ConfluenceHistory = {
  createdBy: ConfluencePerson,
  createdDate: string
}


export function pageForIndexing ( page: ConfluencePage ) {
  return {
    type: 'confluence',
    id: page.id,
    space: page.space.key,
    status: page.status,
    title: page.title,
    body: page?.body?.view?.value,
    created_by: page.history.createdBy.username,
    last_updated: page.version.by.username
  }
}
async function useResults ( json: any ) { return await json?.results; }


export const indexConfluenceSpaces = ( ic: IndexingContext, nfs: IndexTreeNonFunctionals, indexerFn: ( fileTemplate: string, forestId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ) => {
  const nfcFetch: FetchFn = withRetry ( nfs.queryRetryPolicy, withThrottle ( nfs.queryThrottle, ic.fetch ) )
  // const nfcFetch: FetchFn = withThrottle ( nfs.indexThrottle, ic.fetch )
  const fArray: FetchArrayWithPagingType = fetchArrayWithPaging ( nfcFetch, ic.parentChildLogAndMetrics, ConfluencePagingTC, nfs.queryRetryPolicy );
  const fOne = withRetry ( nfs.queryRetryPolicy, fetchOneItem ( nfcFetch ) )
  return async ( confluenceDetails: ConfluenceDetails ) => {
    async function allSpacesNames () {
      const result: string[] = []
      for await ( const space of fArray<ConfluenceSpace> ( `${confluenceDetails.baseurl}rest/api/space`, options, useResults ) )
        result.push ( space.key )
      return result
    }
    const headers = await ic.authFn ( confluenceDetails.auth )
    const options = { headers };
    const spaces = confluenceDetails.spaces ?? await allSpacesNames ()
    const sinceTerm = ` AND lastModified >= now("-${(executeOptions.since)}")`
    for ( const space of spaces ) {
      const spacesTerm = ` AND space = "${space}"`
      const cql = `type=page${spacesTerm}${sinceTerm}`
      console.log ( `cql`, cql )
      const indexer = indexerFn ( confluenceDetails.file, confluenceDetails.index )
      let started = false;
      try {
        for await ( const summary of fArray<ConfluencePageSummary> ( `${confluenceDetails.baseurl}rest/api/search?cql=${encodeURIComponent ( cql )}`, options, useResults ) ) {
          if ( !started ) {
            await indexer.start ( space );
            started = true
          }
          const pageDetails: ConfluencePage = await fOne ( summary.content._links.self + '?expand=body.view,space,history,version', options )
          await indexer.processLeaf ( space, pageDetails.id ) ( pageForIndexing ( pageDetails ) )
        }
        if ( started )
          await indexer.finished ( space )
      } catch ( e ) {
        if ( started ) await indexer.failed ( space, e )
      }
    }
  }
}


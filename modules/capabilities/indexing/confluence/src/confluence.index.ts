import { ExecuteIndexOptions, FetchFn, Indexer, IndexingContext, IndexTreeNonFunctionals, SourceSinkDetails } from "@itsmworkbench/indexing";
import { fetchArrayWithPaging, fetchOneItem, PagingTc, withRetry, withThrottle } from "@itsmworkbench/kleislis";

export interface ConfluenceDetails extends SourceSinkDetails {
  index: string;
  aclIndex: string;
  file: string;
  maxSpaces?: number; // for testing.
  maxPages?: number; // for testing.

}

export type ConfluencePaging = {
  next?: string
}
export function prefixWithUrl ( url: string, next: string ) {
  const parsedUrl = new URL ( url );
  const result = `${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''}${next}`;
  return result;
}
export const ConfluencePagingTC: PagingTc<ConfluencePaging> = {
  zero: () => ({}),
  hasMore: ( p ) => p.next !== undefined,
  logMsg: ( p ) => p.next !== undefined ? `Next page ${p.next}` : 'No more pages',
  url: ( baseUrl, p ) => p.next ? prefixWithUrl ( baseUrl, p.next ) : baseUrl,
  fromResponse: ( data, linkHeader ) =>
    ({ data, page: { next: data?._links?.next } })
}
export type ConfluenceSpace = {
  id: string
  key: string
  _links: { self: string }
}
export type ConfluencePageSummary = {
  id: string
}
export type ConfluencePage = {
  id: string
  body: { view: { value: string } }
}
export type ConfluenceBlog = {
  id: string
}

export function pageForIndexing ( page: ConfluencePage ) {
  return { id: page.id, body: page?.body?.view?.value }
}
export function blogForIndexing ( page: ConfluenceBlog ) {
  return { id: page.id, body: undefined }
}
async function useResults ( json: any ) { return await json?.results; }

export const indexConfluenceSpaces = ( ic: IndexingContext, nfs: IndexTreeNonFunctionals, indexerFn: ( fileTemplate: string, forestId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ) => {
         const nfcFetch: FetchFn = withRetry ( nfs.queryRetryPolicy, withThrottle ( nfs.queryThrottle, ic.fetch ) )
         // const nfcFetch: FetchFn = withThrottle ( nfs.indexThrottle, ic.fetch )
         const fArray = fetchArrayWithPaging ( nfcFetch, ic.parentChildLogAndMetrics, ConfluencePagingTC, nfs.queryRetryPolicy );
         const fOne = withRetry ( nfs.queryRetryPolicy, fetchOneItem ( nfcFetch ) )
         return async ( confluenceDetails: ConfluenceDetails ) => {
           const headers = await ic.authFn ( confluenceDetails.auth )
           const options = { headers };
           let spacesCount = 0;
           for await ( const space of fArray<ConfluenceSpace> ( `${confluenceDetails.baseurl}rest/api/space`, options, useResults ) ) {
             const indexer = indexerFn ( confluenceDetails.file, space.key )
             if ( executeOptions.dryRunJustShowTrees ) {
               console.log ( 'confluence space', space.id, space.key )
             } else {
               let pagesCount = 0;
               await indexer.start ( space.id )
               try {
                 if ( confluenceDetails.maxSpaces === undefined || spacesCount++ < confluenceDetails.maxSpaces )
                   for await ( const pageSummary of fArray<ConfluencePageSummary> ( `${confluenceDetails.baseurl}rest/api/space/${space.key}/content/page`, options, useResults ) ) {
                     async function onePage ( pageSummary: ConfluencePageSummary ) {
                       if ( confluenceDetails.maxPages !== undefined && pagesCount++ >= confluenceDetails.maxPages ) return
                       console.log ( 'page', pageSummary.id )

                       const page = await fOne<ConfluencePage> ( `${confluenceDetails.baseurl}rest/api/content/${pageSummary.id}?expand=body.view,history`, options )
                       if ( !executeOptions.dryRunDoEverythingButIndex ) {
                         const forIndexing = pageForIndexing ( page );
                         if ( forIndexing.body.length > 0 )
                           await indexer.processLeaf ( space.key, page.id.toString () ) ( forIndexing )
                       }
                       for await ( const attachment of fArray<ConfluencePageSummary> ( `${confluenceDetails.baseurl}rest/api/content/${pageSummary.id}/child/attachment`, options, useResults ) )
                         console.log ( 'attachment', JSON.stringify ( attachment ) )
                       for await ( const child of fArray<ConfluencePageSummary> ( `${confluenceDetails.baseurl}rest/api/content/${pageSummary.id}/child/page`, options, useResults ) )
                         await onePage ( child )
                     }
                     await onePage ( pageSummary )
                   }
                 for await ( const blogSummary of fArray<ConfluencePageSummary> ( `${confluenceDetails.baseurl}rest/api/space/${space.key}/content/blogpost`, options, useResults ) ) {
                   const blog = await fOne<ConfluenceBlog> ( `${confluenceDetails.baseurl}rest/api/content/${blogSummary.id}?expand=body.view`, options )
                   if ( !executeOptions.dryRunDoEverythingButIndex )
                     await indexer.processLeaf ( space.id, blog.id ) ( blogForIndexing ( blog ) )
                 }
                 await indexer.finished ( space.id )
               } catch ( e ) {
                 await indexer.failed ( space.id, e )
               }
             }
           }
         }
       }
;
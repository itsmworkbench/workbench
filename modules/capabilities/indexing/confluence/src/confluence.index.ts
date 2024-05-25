import { ExecuteIndexOptions, FetchFn, FetchFnOptions, Indexer, IndexingContext, IndexTreeNonFunctionals, SourceSinkDetails } from "@itsmworkbench/indexing";
import { fetchArrayWithPaging, FetchArrayWithPagingType, fetchOneItem, FetchOneItemType, K2, PagingTc, withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { NameAnd } from "@laoban/utils";
import { calculateSinceDate } from "@itsmworkbench/utils";

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


class ConfluenceIndex {
  nfcFetch: FetchFn
  fArray: FetchArrayWithPagingType
  fOne: K2<string, FetchFnOptions, any>
  executeOptions: ExecuteIndexOptions;
  indexerFn: ( fileTemplate: string, forestId: string ) => Indexer<any>;
  spacesCount: number
  pagesCount: number
  confluenceDetails: ConfluenceDetails;
  private headers: Promise<NameAnd<string>>;
  private options: Promise<FetchFnOptions>;
  sinceQuery: string | undefined
  private sinceQueryWithAnd: string;
  constructor ( ic: IndexingContext, nfs: IndexTreeNonFunctionals, indexerFn: ( fileTemplate: string, forestId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions, confluenceDetails: ConfluenceDetails ) {
    this.indexerFn = indexerFn;
    this.executeOptions = executeOptions;
    this.confluenceDetails = confluenceDetails;
    this.nfcFetch = withRetry ( nfs.queryRetryPolicy, withThrottle ( nfs.queryThrottle, ic.fetch ) )
    this.fArray = fetchArrayWithPaging ( this.nfcFetch, ic.parentChildLogAndMetrics, ConfluencePagingTC, nfs.queryRetryPolicy );
    this.fOne = withRetry ( nfs.queryRetryPolicy, fetchOneItem ( this.nfcFetch ) )
    this.headers = ic.authFn ( confluenceDetails.auth )
    this.options = this.headers.then ( headers => ({ headers }) );
    this.sinceQuery = executeOptions.since ? `updated>=${calculateSinceDate ( executeOptions.since, ic.timeService ).toISOString ()}` : undefined
    this.sinceQueryWithAnd = executeOptions.since ? '&'+ this.sinceQuery : undefined
  }
  indexSpaces = async () => {
    for await ( const space of this.fArray<ConfluenceSpace> ( `${this.confluenceDetails.baseurl}rest/api/space?${this.sinceQuery}`, await this.options, useResults ) )
      await this.indexOneSpace ( space )
  }

  indexOneSpace = async ( space: ConfluenceSpace ) => {
    const confluenceDetails = this.confluenceDetails;
    const indexer = this.indexerFn ( confluenceDetails.file, space.key )
    if ( this.executeOptions.dryRunJustShowTrees ) {
      console.log ( 'confluence space', space.id, space.key )
    } else {
      let pagesCount = 0;
      await indexer.start ( space.id )
      try {
        if ( confluenceDetails.maxSpaces === undefined || this.spacesCount++ < confluenceDetails.maxSpaces ) {
          await this.indexPages ( space, indexer )
          await this.indexBlogs ( space, indexer )
        }
        await indexer.finished ( space.id )

      } catch ( e ) {
        await indexer.failed ( space.id, e )
      }
    }
  }

  indexPages = async ( space: ConfluenceSpace, indexer: Indexer<any> ) => {
    for await ( const pageSummary of this.fArray<ConfluencePageSummary> ( `${this.confluenceDetails.baseurl}rest/api/space/${space.key}/content/page?${this.sinceQuery}`, await this.options, useResults ) )
      await this.onePage ( space, pageSummary, indexer )

  }
  onePage = async ( space: ConfluenceSpace, pageSummary: ConfluencePageSummary, indexer: Indexer<any> ) => {
    const confluenceDetails = this.confluenceDetails;
    const options = await this.options;

    if ( confluenceDetails.maxPages !== undefined && this.pagesCount++ >= confluenceDetails.maxPages ) return
    console.log ( 'page', pageSummary.id )

    const page: ConfluencePage = await this.fOne ( `${confluenceDetails.baseurl}rest/api/content/${pageSummary.id}?expand=body.view,history`, options )
    if ( !this.executeOptions.dryRunDoEverythingButIndex ) {
      const forIndexing = pageForIndexing ( page );
      if ( forIndexing.body.length > 0 )
        await indexer.processLeaf ( space.key, page.id.toString () ) ( forIndexing )
    }
    for await ( const attachment of this.fArray<ConfluencePageSummary> ( `${confluenceDetails.baseurl}rest/api/content/${pageSummary.id}/child/attachment`, options, useResults ) )
      console.log ( 'attachment', JSON.stringify ( attachment ) )
    for await ( const child of this.fArray<ConfluencePageSummary> ( `${confluenceDetails.baseurl}rest/api/content/${pageSummary.id}/child/page`, options, useResults ) )
      await this.onePage ( space, child, indexer )
  }

  indexBlogs = async ( space: ConfluenceSpace, indexer: Indexer<any> ) => {
    const confluenceDetails = this.confluenceDetails;
    const options = await this.options;
    for await ( const blogSummary of this.fArray<ConfluencePageSummary> ( `${confluenceDetails.baseurl}rest/api/space/${space.key}/content/blogpost`, options, useResults ) ) {
      const blog: ConfluenceBlog = await this.fOne ( `${confluenceDetails.baseurl}rest/api/content/${blogSummary.id}?expand=body.view`, options )
      if ( !this.executeOptions.dryRunDoEverythingButIndex )
        await indexer.processLeaf ( space.id, blog.id ) ( blogForIndexing ( blog ) )
    }
  }
}

//Adapter to for index.all
export const indexConfluenceSpaces = (
  ic: IndexingContext,
  nfs: IndexTreeNonFunctionals,
  indexerFn: ( fileTemplate: string, forestId: string ) => Indexer<any>,
  executeOptions: ExecuteIndexOptions ) =>
  async ( confluenceDetails: ConfluenceDetails ) => {
    const confluenceIndex = new ConfluenceIndex ( ic, nfs, indexerFn, executeOptions, confluenceDetails );
    return confluenceIndex.indexSpaces ();
  };

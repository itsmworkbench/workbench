import { AccessConfig, FetchFn, FetchFnOptions, FetchFnResponse } from "./access";
import { IndexParentChildLogAndMetrics } from "./index.parent.child";
import { RetryPolicyConfig, withRetry } from "@itsmworkbench/kleislis";

export const noPagingAccessConfig: AccessConfig<NoPaging> = {
  pagingFn: ( json, linkHeader ) => ({})
}

export type WithPaging<T, P> = { data: T, page?: P }

export type PagingTc<Paging> = {
  zero: () => Paging
  hasMore: ( p: Paging ) => boolean
  logMsg: ( p: Paging ) => string
  url: ( baseUrl: string, p: Paging ) => string
  fromResponse: <T>( json: any, linkHeader: string | undefined ) => WithPaging<T, Paging>
}


export type NoPaging = {}

export const NoPagingTc: PagingTc<NoPaging> = {
  zero: () => ({}),
  hasMore: () => false,
  logMsg: () => ``,
  url: ( baseUrl ) => baseUrl,
  fromResponse: ( data ) => ({ data })
}

export function mapWithPaging<T, T1> ( fn: ( t: T ) => T1 ): <P>( wp: WithPaging<T, P> ) => WithPaging<T1, P> {
  return wp => ({ data: fn ( wp.data ), page: wp.page })
}

export type FetchOneItemType = <T>( url: string, options: FetchFnOptions, resfn?: ( response: FetchFnResponse ) => Promise<T> ) => Promise<T>

export function fetchOneItem ( fetch: FetchFn ): FetchOneItemType {
  return async <T> ( url: string, options: FetchFnOptions, respFn?: ( response: FetchFnResponse ) => Promise<T> ): Promise<T> => {
    const response = await fetch ( url, {
      method: options?.method || 'Get',
      headers: options?.headers,
      body: options?.body
    } );
    if ( response.status === 404 )
      throw Error ( 'Not Found' )
    if ( !response.ok )
      throw new Error ( `Error fetching ${url}: ${response.statusText}\n${await response.text ()}` )
    return respFn ? await respFn ( response ) : await response.json ();
  }

}
const fetchOneForPaging = <P> ( fetchFn: ( url: string, options?: FetchFnOptions ) => Promise<FetchFnResponse>, tc: PagingTc<P>, log: IndexParentChildLogAndMetrics ) => async <T> ( url: string, options: FetchFnOptions, paging: P, ) => {
  const fullUrl = tc.url ( url, paging )
  log.parentId ( url, tc.logMsg ( paging ) );
  const response = await fetchFn ( fullUrl, {
    method: options?.method || 'Get',
    headers: options?.headers,
    body: options?.body
  } );
  if ( response.status === 404 ) {
    log.notfoundParent ( url );
    throw Error ( 'Not Found' )
  }
  if ( response.status === 429 ) {
    throw Error ( 'Too many requests' )
  }
  if ( !response.ok ) {
    const msg = `${response.statusText}\n${await response.text ()}`;
    log.failedParent ( url, msg );
    throw new Error ( `Error fetching ${fullUrl}: ${msg}` )
  }
  const json = await response.json ();
  const withPaging = tc.fromResponse<T> ( json, response.headers?.link )
  return withPaging;
};
export function fetchWithPaging<P> (
  fetchFn: FetchFn,
  log: IndexParentChildLogAndMetrics,
  tc: PagingTc<P>,
  retry?: RetryPolicyConfig,
): <T>( url: string, options?: FetchFnOptions, valueFn?: ( json: any ) => Promise<T> ) => AsyncGenerator<T, void> {
  const f = withRetry ( retry, fetchOneForPaging ( fetchFn, tc, log ) );
  return async function* <T> ( url: string, options?: FetchFnOptions, valueFn?: ( json: any ) => Promise<T> ): AsyncGenerator<T, void> {
    let paging = tc.zero ();
    do {
      const withPaging = await f<T> ( url, options, paging );
      const data = valueFn ? await valueFn ( withPaging.data ) : withPaging.data
      log.children ( url, tc.logMsg ( paging ), Array.isArray ( data ) ? data : [ data ], d => JSON.stringify ( d ) );
      yield data;
      paging = withPaging.page;
    } while ( paging !== undefined && tc.hasMore ( paging ) );
    log.finishedParent ( url );
  };
}

export type FetchArrayWithPagingType = <T>( url: string, options?: FetchFnOptions, resfn?: ( response: FetchFnResponse ) => Promise<T[]> ) => AsyncGenerator<T, void>
export function fetchArrayWithPaging<P> (
  fetch: FetchFn,
  log: IndexParentChildLogAndMetrics,
  tc: PagingTc<P>,
  retry?: RetryPolicyConfig,
): FetchArrayWithPagingType {
  const f = fetchWithPaging ( fetch, log, tc, retry );
  return async function* <T> ( url: string, options?: FetchFnOptions, resfn?: ( response: FetchFnResponse ) => Promise<T[]> ): AsyncGenerator<T, void> {
    for await ( const item of f ( url, options, resfn ) ) {
      for ( let t of item )
        yield t;
    }
  };
}


export type TreeTc<T> = {
  treeUrl: ( baseUrl: string, treeId: string ) => string
  leafUrl: ( baseUrl: string, leafId: string ) => string
  getTreeIds: ( data: T ) => string[];
  getLeafIds: ( data: T ) => string[];
};

//Note we could easily refactor this and make it shorter. But when trying to understand it, and single step through it, I find it easier like this.
//An interesting case where I think cohession wins out over DRY
export function fetchLeavesForTree<Tree, P> (
  fetch: ( url: string, options?: FetchFnOptions ) => Promise<FetchFnResponse>,
  pagingTc: PagingTc<P>,
  treeTc: TreeTc<Tree>
): <Leaf>( baseUrl: string, treeId: string ) => AsyncGenerator<Leaf, void> {
  return async function* <Leaf> ( baseUrl: string, treeId: string ): AsyncGenerator<Leaf, void> {
    async function* fetchTreeAndLeaves ( currentTreeId: string ): AsyncGenerator<Leaf, void> {
      let treePaging = pagingTc.zero ()
      do {
        const treeUrl = pagingTc.url ( treeTc.treeUrl ( baseUrl, currentTreeId ), treePaging );
        const response = await fetch ( treeUrl );
        const json = await response.json ();
        const linkHeader = response.headers?.link;
        const treeAndPage = pagingTc.fromResponse<Tree> ( json, linkHeader );

        // Process subtrees
        const treeIds = treeTc.getTreeIds ( treeAndPage.data );
        for ( const id of treeIds ) yield* fetchTreeAndLeaves ( id );

        // Process leaves
        let leafPaging = pagingTc.zero ();

        do {
          const leafUrl = pagingTc.url ( treeTc.leafUrl ( baseUrl, currentTreeId ), leafPaging );
          const leafResponse = await fetch ( leafUrl );
          const leafJson = await leafResponse.json ();
          const leafLinkHeader = leafResponse.headers?.link;
          const leafAndPage = pagingTc.fromResponse<Leaf[]> ( leafJson, leafLinkHeader );
          for ( const leaf of leafAndPage.data ) yield leaf;
          leafPaging = leafAndPage.page;
        } while ( leafPaging !== undefined && pagingTc.hasMore ( leafPaging ) );

        treePaging = treeAndPage.page;
      } while ( treePaging !== undefined && pagingTc.hasMore ( treePaging ) );
    }
    yield* fetchTreeAndLeaves ( treeId );
  };
}

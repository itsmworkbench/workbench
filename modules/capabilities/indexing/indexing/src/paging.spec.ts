// Array of mock return values
import { fetchArrayWithPaging, fetchWithPaging, PagingTc, WithPaging } from "./paging";
import { FetchFnOptions, FetchFnResponse } from "./access";
import { rememberIndexParentChildLogsAndMetrics } from "./index.parent.child";

const remembered: any[ ] = []
const msgs: string[] = []
// PagingTc instance for numbers
const pagingTc: PagingTc<number> = {
  zero: () => 1,
  hasMore: ( p: number | undefined ) => p !== undefined,
  logMsg: ( p: number | undefined ) => p !== undefined ? `Fetching page ${p}` : 'No more pages',
  url: ( baseUrl: string, p: number | undefined ) => baseUrl + `?page=${p}`,
  fromResponse: ( json: any, linkHeader: string | undefined ) => {
    return json // Note that this assumes that json is a withPaging object
  }
};
const log = rememberIndexParentChildLogsAndMetrics ( msgs )
const someHeaders = { some: 'header' };
describe ( "fetchArrayWithPaging", () => {
  beforeEach ( () => {
    msgs.length = 0;
    remembered.length = 0;
  } )
  const mockData: Array<WithPaging<string[], number>> = [
    { data: [ 'Page_1a', 'Page_1b' ], page: 2 },
    { data: [ 'Page_2' ], page: undefined }
  ];
// Mock fetch function using the array
  const fetchFunction = async ( url: string, options: FetchFnOptions ): Promise<FetchFnResponse> => {
    remembered.push ( { url, options } );
    const page = Number.parseInt ( url[ url.length - 1 ] );
    const body = mockData[ page - 1 ] || { data: [], page: undefined };
    return {
      status: 200,
      ok: true,
      json: async () => body,
      text: async () => JSON.stringify ( body ),
      headers: {},
      statusText: 'OK'
    }
  };


  test ( 'fetchArrayWithPaging fetches paginated data correctly', async () => {
    const fetchItems = fetchArrayWithPaging<number> ( fetchFunction, log, pagingTc );
    const url = 'https://api.example.com/items';

    const receivedItems: string[] = [];
    for await ( const item of fetchItems<string> ( url, { headers: someHeaders } ) ) {
      receivedItems.push ( item );
    }

    expect ( receivedItems ).toEqual ( [ "Page_1a", "Page_1b", "Page_2" ] );
    expect ( remembered ).toEqual ( [
      { "options": { "headers": { "some": "header" }, "method": "Get" }, "url": "https://api.example.com/items?page=1" },
      { "options": { "headers": { "some": "header" }, "method": "Get" }, "url": "https://api.example.com/items?page=2" }
    ] );
  } );
} )

describe ( "fetchWithPaging", () => {
  beforeEach ( () => remembered.length = 0 )
  const mockData: Array<WithPaging<string, number>> = [
    { data: 'Page_One', page: 2 },
    { data: 'Page_Two', page: undefined }
  ];
  const fetchFunction = async ( url: string, options: FetchFnOptions ): Promise<FetchFnResponse> => {
    remembered.push ( { url, options } );
    const page = Number.parseInt ( url[ url.length - 1 ] );
    const body = mockData[ page - 1 ] || { data: [], page: undefined };
    return {
      status: 200,
      ok: true,
      json: async () => body,
      text: async () => JSON.stringify ( body ),
      headers: {},
      statusText: 'OK'
    }
  };
  test ( 'fetchWithPaging fetches paginated data correctly', async () => {
    const fetchItems = fetchWithPaging<number> ( fetchFunction, log, pagingTc );
    const url = 'https://api.example.com/items';

    const receivedItems: string[] = [];
    for await ( const item of fetchItems<string> ( url, { headers: someHeaders } ) ) {
      receivedItems.push ( item );
    }

    expect ( receivedItems ).toEqual ( [ 'Page_One', 'Page_Two' ] );
    expect ( remembered ).toEqual ( [
      { "options": { "headers": { "some": "header" }, "method": "Get" }, "url": "https://api.example.com/items?page=1" },
      { "options": { "headers": { "some": "header" }, "method": "Get" }, "url": "https://api.example.com/items?page=2" }
    ] );
  } )
} )


type MockTree = { leafIds: string[], page?: number };
type MockLeaf = { id: string, data: string };

const mockTreeData: Record<string, Array<WithPaging<MockTree, number>>> = {
  'tree1': [
    { data: { leafIds: [ 'leaf1_1', 'leaf1_2' ] }, page: 2 },
    { data: { leafIds: [ 'leaf2_1', 'leaf2_2' ] }, page: undefined }
  ],
  'subtree1': [
    { data: { leafIds: [ 'leaf3_1' ] }, page: undefined }
  ]
};

function makeResponse ( data: any ) {
  return {
    json: async () => data,
    text: async () => JSON.stringify ( data ),
    status: 200,
    statusText: 'OK',
    ok: true,
    headers: { link: null }
  };
}

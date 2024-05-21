import { EntraIdAuthentication } from "@itsmworkbench/indexconfig";
import { authForEntraId, FetchFn, FetchFnResponse, getOrUpdateEntraId, TokenCache } from "./access";
import fetch from "node-fetch";
import { NameAnd } from "@laoban/utils";

const auth: EntraIdAuthentication = {
  method: 'EntraId',
  credentials: {
    tenantId: '03e6c03e-074e-474c-8d40-3eac96d82a77',
    clientId: '2e809693-f124-4729-bfea-086d5a9a8ce8',
    clientSecret: 'INDEX_CLIENT_SECRET',
    scope: 'https://graph.microsoft.com/.default',
  }
}
let fetchFn: FetchFn = async ( url, options ) => {
  console.log ( `Fetching: ${url}` )
  const res = await fetch ( url, options );
  const headers: NameAnd<string> = {}
  res.headers.forEach ( ( value, name ) => {
    headers[ name ] = value
  } )
  const result: FetchFnResponse = {
    status: res.status,
    ok: res.ok,
    json: () => res.json (),
    text: () => res.text (),
    headers,
    statusText: res.statusText
  }
  return result;
};

describe ( "getOrUpdateEntraId", () => {
  it ( "should fetch a token", async () => {
    const tokenCache: TokenCache = {}
    const timeService = () => 1000
    const token = await getOrUpdateEntraId ( fetchFn, timeService, auth, tokenCache, authForEntraId )

    expect ( token ).toBeDefined ()
    const inCache = await tokenCache[ auth.credentials.clientId ]
    expect ( inCache.token ).toEqual ( token )
    expect ( inCache.expires ).toEqual ( 1800500 )
  } )
  it ( "should return a cached token", async () => {
    const tokenCache: TokenCache = {}
    const timeService = () => 1000
    const firstToken = await getOrUpdateEntraId ( fetchFn, timeService, auth, tokenCache, authForEntraId )
    const secondToken = await getOrUpdateEntraId ( fetchFn, timeService, auth, tokenCache, () => {throw Error ( 'should not be aclled' )} )
    expect ( secondToken ).toEqual ( firstToken )
  } )
  it ( "should return a new token if expired", async () => {
    const tokenCache: TokenCache = {}
    const firstToken = await getOrUpdateEntraId ( fetchFn, () => 0, auth, tokenCache, authForEntraId )
    const secondToken = await getOrUpdateEntraId ( fetchFn, () => 1800501, auth, tokenCache, authForEntraId )
    expect ( secondToken ).not.toEqual ( firstToken )
    const inCache = await tokenCache[ auth.credentials.clientId ]
    expect ( inCache.token ).toEqual ( secondToken )
    expect ( inCache.expires ).toEqual ( 3600001 )
  } )
} )
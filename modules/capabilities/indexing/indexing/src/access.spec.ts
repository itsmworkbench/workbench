import { getOrUpdateEntraId, authForEntraId, FetchFn, TokenCache, FetchFnResponse } from './access';
import { Timeservice } from "@itsmworkbench/utils";
import { EntraIdAuthentication } from "@itsmworkbench/indexconfig";

describe ( 'getOrUpdateEntraId', () => {
  let fetchMock: jest.MockedFunction<FetchFn>;
  let timeServiceMock: jest.MockedFunction<Timeservice>;
  let oauthMock: EntraIdAuthentication;
  let tokenCacheMock: TokenCache;
  let authForEntraIdFnMock: jest.MockedFunction<typeof authForEntraId>;

  beforeEach ( () => {
    fetchMock = jest.fn ();
    timeServiceMock = jest.fn ();
    oauthMock = {
      method: 'EntraId',
      credentials: {
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        scope: 'test-scope',
      },
    };
    tokenCacheMock = {};
    authForEntraIdFnMock = jest.fn ();
  } );

  it ( 'should return cached token if it is still valid', async () => {
    const cachedToken = {
      token: 'cached-token',
      expires: Date.now () + 10000,
    };
    tokenCacheMock[ oauthMock.credentials.clientId ] = Promise.resolve ( cachedToken );
    timeServiceMock.mockReturnValue ( Date.now () );

    const token = await getOrUpdateEntraId ( fetchMock, timeServiceMock, oauthMock, tokenCacheMock, authForEntraIdFnMock );

    expect ( token ).toBe ( 'cached-token' );
  } );

  it ( 'should fetch a new token if there is no valid cached token', async () => {
    const newTokenResponse = {
      token: 'new-access-token',
      expires: 3600,
    };
    authForEntraIdFnMock.mockResolvedValueOnce ( newTokenResponse );
    timeServiceMock.mockReturnValue ( Date.now () );
    tokenCacheMock[ oauthMock.credentials.clientId ] = undefined;

    const token = await getOrUpdateEntraId ( fetchMock, timeServiceMock, oauthMock, tokenCacheMock, authForEntraIdFnMock );

    expect ( token ).toBe ( 'new-access-token' );
    expect ( tokenCacheMock[ oauthMock.credentials.clientId ] ).toBeDefined ();
    expect ( authForEntraIdFnMock ).toHaveBeenCalledWith ( fetchMock, oauthMock );
  } );

  it ( 'should handle errors during token fetching and clear the cache', async () => {
    authForEntraIdFnMock.mockRejectedValueOnce ( new Error ( 'Failed to fetch token' ) );
    timeServiceMock.mockReturnValue ( Date.now () );
    tokenCacheMock[ oauthMock.credentials.clientId ] = undefined;

    await expect ( getOrUpdateEntraId ( fetchMock, timeServiceMock, oauthMock, tokenCacheMock, authForEntraIdFnMock ) ).rejects.toThrow ( 'Failed to fetch token' );
    expect ( tokenCacheMock[ oauthMock.credentials.clientId ] ).toBeUndefined ();
  } );

  it ( 'should throw an error if the token response is invalid', async () => {
    const invalidTokenResponse = {
      expires: 3600,
    };
    authForEntraIdFnMock.mockResolvedValueOnce ( invalidTokenResponse as any );
    timeServiceMock.mockReturnValue ( Date.now () );
    tokenCacheMock[ oauthMock.credentials.clientId ] = undefined;

    await expect ( getOrUpdateEntraId ( fetchMock, timeServiceMock, oauthMock, tokenCacheMock, authForEntraIdFnMock ) ).rejects.toThrow ( 'No access token in' );
  } );
} );

describe ( 'authForEntraId', () => {
  let fetchMock: jest.MockedFunction<FetchFn>;
  let oauthMock: EntraIdAuthentication;

  beforeEach ( () => {
    fetchMock = jest.fn ();
    oauthMock = {
      method: 'EntraId',
      credentials: {
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        scope: 'test-scope',
      },
    };
  } );

  it ( 'should fetch a token successfully', async () => {
    const tokenResponse = {
      access_token: 'new-access-token',
      expires_in: 3600,
    };
    fetchMock.mockResolvedValue ( {
      ok: true,
      status: 200,
      json: async () => tokenResponse,
    } as FetchFnResponse );

    const result = await authForEntraId ( fetchMock, oauthMock );

    expect ( result ).toEqual ( { token: 'new-access-token', expires: 3600 } );
    expect ( fetchMock ).toHaveBeenCalledWith (
      'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/token',
      {
        method: 'Post',
        body: new URLSearchParams ( {
          grant_type: 'client_credentials',
          client_id: 'test-client-id',
          client_secret: 'test-client-secret',
          scope: 'test-scope',
        } ).toString (),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
  } );

  it ( 'should throw an error if the response is not ok', async () => {
    fetchMock.mockResolvedValue ( {
      ok: false,
      status: 400,
      statusText: 'Bad Request',
    } as FetchFnResponse );

    await expect ( authForEntraId ( fetchMock, oauthMock ) ).rejects.toThrow ( 'Error fetching access token: Bad Request' );
  } );
} );


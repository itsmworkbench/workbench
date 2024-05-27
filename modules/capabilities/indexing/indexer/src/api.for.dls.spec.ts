import { ApiKeyDetails, fetchAllApiKeys, findApiKeysForEmail, getElasticSearchAuthHeaderWithBasicToken, invalidateApiKeysForEmail, makeApiKey } from "./apikey.for.dls";
import { FetchFn } from "@itsmworkbench/indexing";

describe ( 'getElasticSearchAuthHeaderWithBasicToken', () => {
  const mockEnv = {
    someEnvVar: 'someEnvValue',
    anotherEnvVar: 'anotherEnvValue',
  };

  it ( 'should return correct Authorization header when token is a string', () => {
    const username = 'testUser';
    const password = 'someEnvVar';

    const result = getElasticSearchAuthHeaderWithBasicToken ( mockEnv, username, password );

    const expectedAuthHeader = {
      'Authorization': 'Basic ' + Buffer.from ( 'testUser:someEnvValue' ).toString ( 'base64' ),
    };

    expect ( result ).toEqual ( expectedAuthHeader );
  } );

  it ( 'should handle missing environment variable gracefully', () => {
    const username = 'testUser';
    const password = 'missingEnvVar';

    const mockExit = jest.spyOn ( process, 'exit' ).mockImplementation ( ( code ) => {
      throw new Error ( `process.exit called with code ${code}` );
    } );

    expect ( () => getElasticSearchAuthHeaderWithBasicToken ( mockEnv, username, password ) ).toThrow ( 'Environment variable [missingEnvVar] not defined' );

    mockExit.mockRestore ();
  } );
} );

describe ( 'makeApiKey', () => {
  const apiDetails = {
    username: 'testUser',
    elasticSearchUrl: 'http://localhost:9200/',
    index: [ 'index1', 'index2' ],
    deletePrevious: false,
    headers: {
      'Authorization': 'Basic dGVzdFVzZXI6dGVzdFBhc3N3b3Jk',
    },
  };
  const email = 'test@example.com';
  const query = { match_all: {} };

  let fetchInput: RequestInfo;
  let fetchInit: RequestInit;

  // Real fetch function for testing
  const fetchFn: FetchFn = async ( input, init ) => {
    fetchInput = input;
    fetchInit = init;
    return {
      ok: true,
      json: async () => ({ api_key: 'testApiKey' }),
    } as any;
  };

  it ( 'should make a successful API key creation request', async () => {
    const result = await makeApiKey ( fetchFn, apiDetails, email, query );

    expect ( fetchInput ).toBe ( `${apiDetails.elasticSearchUrl}_security/api_key` );
    expect ( fetchInit.method ).toBe ( 'Post' );
    expect ( fetchInit.headers ).toMatchObject ( {
      'Content-Type': 'application/json',
      'Authorization': apiDetails.headers[ 'Authorization' ],
    } );
    expect ( fetchInit.body ).toBe ( JSON.stringify ( {
      name: `dls_for_${email}`,
      role_descriptors: {
        "search": {
          "cluster": [ "all" ],
          "index": [
            {
              "names": apiDetails.index,
              "privileges": [ "read" ],
              query,
            },
          ],
        },
      },
    } ) );
    expect ( result ).toEqual ( {
      api_key: 'testApiKey',
      "username": "testUser"
    } );
  } );

  it ( 'should throw an error if the API request fails', async () => {
    const failingFetchFn: FetchFn = async ( input, init ) => {
      fetchInput = input;
      fetchInit = init;
      return {
        ok: false,
        status: 500,
        statusText: 'someStatusText',
        text: () => `someError`
      } as any;
    };

    await expect ( makeApiKey ( failingFetchFn, apiDetails, email, query ) ).rejects.toThrow ( 'Error 500 someStatusText someError' );
  } );
} );


describe('fetchAllApiKeys', () => {
  const apiDetails = {
    username: 'testUser',
    elasticSearchUrl: 'http://localhost:9200/',
    index: ['index1', 'index2'],
    deletePrevious: false,
    headers: {
      'Authorization': 'Basic dGVzdFVzZXI6dGVzdFBhc3N3b3Jk',
    },
  };

  let fetchInput: RequestInfo;
  let fetchInit: RequestInit;

  // Real fetch function for testing
  const fetchFn: FetchFn = async (input, init) => {
    fetchInput = input;
    fetchInit = init;
    return {
      ok: true,
      json: async () => ({ api_keys: [{ id: '1', name: 'apiKey1', expiration: '2024-01-01' }] }),
    } as any;
  };

  it('should fetch all API keys successfully', async () => {
    const result = await fetchAllApiKeys(fetchFn, apiDetails);

    expect(fetchInput).toBe(`${apiDetails.elasticSearchUrl}_security/api_key`);
    expect(fetchInit.headers).toMatchObject(apiDetails.headers);
    expect(result).toEqual([{ id: '1', name: 'apiKey1', expiration: '2024-01-01' }]);
  });

  it('should throw an error if the API request fails', async () => {
    const failingFetchFn: FetchFn = async (input, init) => {
      fetchInput = input;
      fetchInit = init;
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      } as any;
    };

    await expect(fetchAllApiKeys(failingFetchFn, apiDetails)).rejects.toThrow('Error 500 Internal Server Error Server error');
  });
});

describe('findApiKeysForEmail', () => {
  const apiDetails: ApiKeyDetails = {
    username: 'testUser',
    elasticSearchUrl: 'http://localhost:9200/',
    index: ['index1', 'index2'],
    deletePrevious: false,
    headers: {
      'Authorization': 'Basic dGVzdFVzZXI6dGVzdFBhc3N3b3Jk',
    },
  };

  let fetchInput: RequestInfo;
  let fetchInit: RequestInit;

  // Real fetch function for testing
  const fetchFn: FetchFn = async (input, init) => {
    fetchInput = input;
    fetchInit = init;
    return {
      ok: true,
      json: async () => ({
        api_keys: [
          { id: '1', name: 'dls_for_test@example.com', expiration: '2024-01-01' },
          { id: '2', name: 'dls_for_another@example.com', expiration: '2024-01-01' },
        ],
      }),
    } as any;
  };

  it('should find API keys for a given email', async () => {
    const findKeys = findApiKeysForEmail(fetchFn, apiDetails);
    const email = 'test@example.com';
    const result = await findKeys(email);

    expect(fetchInput).toBe(`${apiDetails.elasticSearchUrl}_security/api_key`);
    expect(fetchInit.headers).toMatchObject(apiDetails.headers);
    expect(result).toEqual([{ id: '1', name: 'dls_for_test@example.com', expiration: '2024-01-01' }]);
  });

  it('should return an empty array if no API keys match the email', async () => {
    const findKeys = findApiKeysForEmail(fetchFn, apiDetails);
    const email = 'nonexistent@example.com';
    const result = await findKeys(email);

    expect(result).toEqual([]);
  });
});

describe('invalidateApiKeysForEmail', () => {
  const apiDetails: ApiKeyDetails = {
    username: 'testUser',
    elasticSearchUrl: 'http://localhost:9200',
    index: ['index1', 'index2'],
    deletePrevious: false,
    headers: {
      'Authorization': 'Basic dGVzdFVzZXI6dGVzdFBhc3N3b3Jk',
    },
  };

  let fetchInput: RequestInfo;
  let fetchInit: RequestInit;

  // Real fetch function for testing
  const fetchFn: FetchFn = async (input, init) => {
    fetchInput = input;
    fetchInit = init;
    if (input.includes('_security/api_key') && init?.method === 'Delete') {
      return {
        ok: true,
        json: async () => ({ invalidated_api_keys: ['1'] }),
      } as any;
    }
    return {
      ok: true,
      json: async () => ({
        api_keys: [
          { id: '1', name: 'dls_for_test@example.com', expiration: '2024-01-01' },
          { id: '2', name: 'dls_for_another@example.com', expiration: '2024-01-01' },
        ],
      }),
    } as Response;
  };

  it('should invalidate API keys for a given email', async () => {
    const invalidateKeys = invalidateApiKeysForEmail(fetchFn, apiDetails);
    const email = 'test@example.com';
    const result = await invalidateKeys(email);

    expect(fetchInput).toBe(`${apiDetails.elasticSearchUrl}_security/api_key`);
    expect(fetchInit.headers).toMatchObject({ ...apiDetails.headers, 'Content-Type': 'application/json' });
    expect(fetchInit.method).toBe('Delete');
    expect(fetchInit.body).toBe(JSON.stringify({ ids: ['1'] }));
    expect(result).toEqual({ invalidated_api_keys: ['1'] });
  });

  it('should throw an error if the API request fails', async () => {
    const failingFetchFn: FetchFn = async (input, init) => {
      fetchInput = input;
      fetchInit = init;
      return {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      } as any;
    };

    const invalidateKeys = invalidateApiKeysForEmail(failingFetchFn, apiDetails);
    const email = 'test@example.com';

    await expect(invalidateKeys(email)).rejects.toThrow('Error 500 Internal Server Error Server error');
  });
});

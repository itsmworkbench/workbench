import { validateConfig, cleanAndEnrichConfig, IndexItem, PopulatedIndexItem } from "./index.config";
import { indexConfigExample } from "./index.config.fixture";
import { isApiKeyAuthentication } from "./authentication.domain";
import { NameAnd } from "@laoban/utils";

describe ( 'Configuration Validation', () => {
  test ( 'should throw error when required fields are missing', () => {
    const incompleteItem = {
      index: {
        github: {
          // omitting required 'authentication'
          scan: {
            organisations: [ 'laoban' ],
          }
        }
      }
    };
    try {
      validateConfig ( cleanAndEnrichConfig ( incompleteItem, {} ) )
      throw new Error ( 'Expected an error' );
    } catch ( e ) {
      expect ( e.message ).toEqual ( 'query is required in github\n' +
        ' {"index":"github","type":"github","scan":{"organisations":["laoban"]}}' );
    }

  } );

  test ( 'should accept a complete and valid configuration', () => {
    const validConfig = cleanAndEnrichConfig ( indexConfigExample, indexConfigExample.defaults );
    expect ( () => validateConfig ( validConfig ) ).not.toThrow ();
  } );
} );

describe ( 'Deep Merging Logic', () => {
  test ( 'overrides default throttle in specific configuration', () => {
    const enrichedConfig = cleanAndEnrichConfig ( indexConfigExample, indexConfigExample.defaults );
    expect ( enrichedConfig.github.query.throttle.max ).toBe ( 1000 );
  } );

  test ( 'inherits default authentication when not overridden', () => {
    const enrichedConfig = cleanAndEnrichConfig ( indexConfigExample, indexConfigExample.defaults );
    if ( !isApiKeyAuthentication ( enrichedConfig.github.auth ) ) throw new Error ( 'Authentication not found' );
    expect ( enrichedConfig.github.auth.credentials.apiKey ).toContain ( '_APIKEY' );
  } );

  test ( 'do the lot', () => {
    const expected: NameAnd<PopulatedIndexItem> = {
      "github": {
        "auth": {
          "credentials": {
            "apiKey": "GITHUB_APIKEY"
          },
          "method": "ApiKey"
        },
        "index": "github",
        "query": {
          "retry": {
            "initialInterval": 2000,
            "maximumAttempts": 3,
            "maximumInterval": 30000,
            "nonRecoverableErrors": [
              "Not Found"
            ]
          },
          "throttle": {
            "max": 1000
          }
        },
        "scan": {
          "aclIndex": ".search-acl-filter-github",
          "indexPeople": true,
          "organisations": [
            "laoban",
            "itsmworkbench"
          ],
          "owners": [
            "phil-rice"
          ]
        },
        "target": {
          "file": "target/index/{source}/{name}_{num}.json",
          "max": 10000000,
          "retry": {
            "initialInterval": 1000,
            "maximumAttempts": 3,
            "maximumInterval": 30000,
            "nonRecoverableErrors": [
              "Not Found",
              "Not Found"
            ]
          },
          "throttle": {
            "max": 10000
          }
        },
        "type": "github"
      },
      "jira": {
        "auth": {
          "credentials": {
            "apiKey": "GITHUB_APIKEY"
          },
          "method": "ApiKey"
        },
        "index": "jira",
        "query": {
          "retry": {
            "initialInterval": 2000,
            "maximumAttempts": 3,
            "maximumInterval": 30000,
            "nonRecoverableErrors": [
              "Not Found"
            ]
          },
          "throttle": {
            "max": 1000
          }
        },
        "scan": {
          "aclIndex": ".search-acl-filter-jira",
          "projects": [
            "ITSMB",
            "ITSMBW"
          ],
          "types": [
            "bug",
            "story"
          ]
        },
        "target": {
          "file": "target/index/{index}/{name}_{num}.json",
          "max": 10000000,
          "retry": {
            "initialInterval": 1000,
            "maximumAttempts": 3,
            "maximumInterval": 30000,
            "nonRecoverableErrors": [
              "Not Found"
            ]
          },
          "throttle": {
            "max": 10000
          }
        },
        "type": "jira"
      },
      "jira2": {
        "auth": {
          "credentials": {
            "apiKey": "GITHUB_APIKEY"
          },
          "method": "ApiKey"
        },
        "index": "jira2",
        "query": {
          "retry": {
            "initialInterval": 2000,
            "maximumAttempts": 3,
            "maximumInterval": 30000,
            "nonRecoverableErrors": [
              "Not Found"
            ]
          },
          "throttle": {
            "max": 1000
          }
        },
        "scan": {
          "aclIndex": ".search-acl-filter-jira2",
          "projects": [
            "ITSMB",
            "ITSMBW"
          ],
          "types": [
            "bug",
            "story"
          ]
        },
        "target": {
          "file": "target/index/{index}/{name}_{num}.json",
          "max": 10000000,
          "retry": {
            "initialInterval": 1000,
            "maximumAttempts": 3,
            "maximumInterval": 30000,
            "nonRecoverableErrors": [
              "Not Found"
            ]
          },
          "throttle": {
            "max": 10000
          }
        },
        "type": "jira"
      }
    };
    expect ( cleanAndEnrichConfig ( indexConfigExample, indexConfigExample.defaults ) ).toEqual ( expected)
  } )
} );

// Further tests can be added to cover more specific cases and integration tests

import { RawIndexConfig } from "./index.config";
import { defaultRetryPolicy } from "@itsmworkbench/kleislis";

export const indexConfigExample: RawIndexConfig = {
  defaults: {
    query: {
      retry: {
        initialInterval: 2000,
        maximumInterval: 30000,
        maximumAttempts: 3,
        nonRecoverableErrors: [ 'Not Found' ]
      },
      throttle: { max: 1000 },
    },
    auth: {
      method: 'ApiKey',
      credentials: {
        apiKey: '{source}_APIKEY'
      }
    },
    target: {
      retry: defaultRetryPolicy,
      throttle: { max: 10000 },
      file: 'target/index/{index}/{name}_{num}.json',
      max: 10 * 1000 * 1000
    },
    scan: {
      aclIndex: '{source}/.search-acl-filter-{index}'
    }
  },

  index: {
    github: {
      query: { throttle: { max: 1000 } },
      scan: {
        organisations: [ 'laoban', 'itsmworkbench' ],
        owners: [ 'phil-rice' ],
        indexPeople: true,
        // aclIndex:  this defaults to '.search-acl-filter-{name}'
        // https://www.elastic.co/guide/en/enterprise-search/current/dls-overview.html#dls-overview-access-control-documents
        //
        //note extensions of md will be defaulted in, as will the url of api.github.com
      },
      target: {
        retry: defaultRetryPolicy,
        throttle: { max: 10000 },
        file: 'target/index/{source}/{name}_{num}.json',
        max: 10 * 1000 * 1000
      },
    },
    jira:{
      query: { throttle: { max: 1000 } },
      scan: {
        projects: [ 'ITSMB', 'ITSMBW' ],
        types: [ 'bug', 'story' ],
      }
    },
    jira2:{
      type: 'jira',
      query: { throttle: { max: 1000 } },
      scan: {
        projects: [ 'ITSMB', 'ITSMBW' ],
        types: [ 'bug', 'story' ],
      }
    }

  }

}
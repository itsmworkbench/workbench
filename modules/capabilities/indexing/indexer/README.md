# Index

This is a tool to index content for elastic search or other search engines, and to provide support for
Document Level Security (DLS). This means that we ensure only people that can see the original document
can see the search result.

# Installation

```bash
npm i -g @itsmworkspace/indexer # Needs to be run as a adminstrator or super user
```

## Requirements:

- Node.js 16 or higher (it might work with lower versions, but it is not tested)

## Example usage

### Indexing
```bash
index index  # Just indexes all the data
index index --api --keep # indexes all the data and launches an api for looking at metrics and keeps running when finished
index index --since 1d # Just index things that have changed in the last day
```

### Api Key Management

Remember to use --help to get more information on the commands especially command configuration (which user, the url, the username and password...)
```bash
index apiKey email@example.com # Generates a DSL api key for the user, invalidating all other DSL api keys
index apiKeyApi # creates an api with end point /apikey/email@welcome.com that returns the api key for the user (invalidating all others)
index removeApiKey email@example.com # Invalidates all the DSL api keys for the user.
```

### Pushing data to elastic search

```bash
index push # Pushes all the data to elastic search
index push --help # Show options for the push command
index push --elastic-search http://localhost:9200 # Pushes all the data to the elastic search at the given url
```

# Configuration

There is a file call `indexer.yaml` that is used to configure the indexer. The file is located in the same directory as
the `indexer` executable.

The file is in YAML format and has the following structure:


## Defaults
The first section of the file is the defaults
```yaml
defaults:
  # here we set defaults values. For example retry policies and throttles.
  query: # Here all the defaults for queries. The 'getting of data out of the source' for example out of Jira, or Confluence or gitlab...
    retryPolicy:
      initialInterval: 2000; # In milliseconds
      maximumInterval: 10000; # In milliseconds
      maximumAttempts: 5
      multiplier?: 2. # For exponential backoff. Default is 2
      nonRecoverableErrors?: string[]; // List of errors that should not be retried. 'Not Found' is the one commonly used
    throttle:
      max: 100  # Imagine tokens in a jar. This is the size of the jar. To do a request you need to take a token from the jar.
      tokensPer100ms: 0.1 # this is how many tokens are added to the jar every 100ms
      throttlingDelay: 50;    // Max random delay before retrying if have run out of tokens in ms defaults 50ms
      countOnTooManyErrors: -500 // If we get a 429 error we will set the number of tokens to this and also reduce the tokensPer100ms a bit
    auth: # see below of other options
      method: ApiKey
      credentials:
        apiKey: "{source}_APIKEY"
  target: # Now we have the defaults for the target. This is currently just storing a file system but I expect to add more
    retry: { } # Same as above 
    throttle: { } # Same as above. Probably not needed for the file system.
    file: "target/index/{index}/{name}_{num}.json" # The filename we write to
    max: 10000000 # The maximum number of documents in a file. When this is reached a new file is created
```

## Sources
The next section is where we get data from. Here is a sample
```yaml
index: # Must be the word index
  jiraAcl: # This is the name of the source. Other things like index name and type default to this
    scan: # Where we get the data from
      groupMembersFile: 'group.members.csv'
      index: '.search-acl-filter-jira-prod'
  jiraProd:
    type: jira
    scan:
      auth:
        method: 'ApiKey'
        credentials:
          apiKey: 'JIRA_PROD'
      index: jira-prod
      projects: "*"
      baseurl: "https://jira.eon.com/"
      apiVersion: "2"
```

## Authorisation

```typescript
export type EntraIdAuthentication = {
  method: 'EntraId';
  credentials: {
    tenantId?: string
    clientId: string;            // Public identifier for the app
    clientSecret: string;        // Secret used to authenticate the app and obtain tokens
    scope: string
  };
};
export type BasicAuthentication = {
  method: 'Basic';
  credentials: {
    username: string;
    password: string;
  };
};
export type ApiKeyAuthentication = {
  method: 'ApiKey';
  credentials: {
    apiKey: string;
  };
};
export type PrivateTokenAuthentication = {
  method: 'PrivateToken';
  credentials: {
    token: string;
  };
};
export type NoAuthentication = {
  method: 'none';
};
```


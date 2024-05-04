export type OAuthAuthentication = {
  method: 'OAuth';
  credentials: {
    clientId: string;            // Public identifier for the app
    clientSecret: string;        // Secret used to authenticate the app and obtain tokens
    tokenEndpoint: string;       // Endpoint used to request tokens
  };
};
export function isOAuthAuthentication(auth: Authentication): auth is OAuthAuthentication {
  return auth?.method === 'OAuth';
}

export type BasicAuthentication = {
  method: 'Basic';
  credentials: {
    username: string;
    password: string;
  };
};
export function isBasicAuthentication(auth: Authentication): auth is BasicAuthentication {
  return auth?.method === 'Basic';
}

export type ApiKeyAuthentication = {
  method: 'ApiKey';
  credentials: {
    apiKey: string;
  };
};
export function isApiKeyAuthentication(auth: Authentication): auth is ApiKeyAuthentication {
  return auth?.method === 'ApiKey';
}

export type NoAuthentication = {
  method: 'none';
};
export function isNoAuthentication(auth: Authentication): auth is NoAuthentication {
  return auth?.method === 'none';
}


// Union export type for general authentication
export type Authentication = OAuthAuthentication | BasicAuthentication | ApiKeyAuthentication | NoAuthentication;
export function isAuthentication(auth: Authentication): auth is Authentication {
  return isOAuthAuthentication(auth) || isBasicAuthentication(auth) || isApiKeyAuthentication(auth) || isNoAuthentication(auth);
}
// Example Usage

import { ErrorsAnd, mapErrors } from "@laoban/utils";

export type IdentityUrl = {
  url?: string // This is the original url that was parsed. Useful for debugging
  scheme: 'itsmid',
  organisation: string,
  namespace: string,
  id: string,
};
export function isIdentityUrl ( x: NamedOrIdentityUrl ): x is IdentityUrl {
  return x.scheme === 'itsmid';
}
export type NamedUrl = {
  url?: string // This is the original url that was parsed. Might not be here. Useful for debugging
  scheme: 'itsm',
  organisation: string,
  namespace: string,
  name: string,
};

export function isNamedUrl ( x: NamedOrIdentityUrl ): x is NamedUrl {
  return x.scheme === 'itsm';
}
export type NamedOrIdentityUrl = NamedUrl | IdentityUrl;


const validPartRegex = /^[a-zA-Z0-9/_\-.]+$/;

export function writeUrl ( url: NamedOrIdentityUrl ): string {
  if ( isNamedUrl ( url ) ) return `${url.scheme}:${url.organisation}:${url.namespace}:${url.name}`;
  if ( isIdentityUrl ( url ) ) return `${url.scheme}:${url.organisation}:${url.namespace}:${url.id}`;
  throw new Error ( `Unexpected url type ${url}` );
}

export function parseUrl ( url: string ): ErrorsAnd<NamedOrIdentityUrl> {
  let decodedUrl = url.replace ( /%3A/g, ':' );
  const parts = decodedUrl.split ( ':' );
  if ( parts.length < 4 ) return [ `${decodedUrl} is not a valid itsm url. It only has ${parts.length} parts` ];
  for ( let i = 0; i < parts.length; i++ )
    if ( !validPartRegex.test ( parts[ i ] ) )
      return [ `Part [${i} (${parts[ i ]}) of ${decodedUrl} contains invalid characters. Only a-z, A-Z, 0-9, and /_-. are allowed.` ];
  const [ scheme, organisation, namespace, fourthPart ] = parts;

  // Adjust scheme check for both 'itsm' and 'itsmid'
  if ( scheme !== 'itsm' && scheme !== 'itsmid' ) return [ `${decodedUrl} is not a valid itsm url. It has the wrong scheme ${scheme}. Legal values are 'itsm' and 'itsmid'` ];

  if ( scheme === 'itsmid' ) {
    const identityUrl: IdentityUrl = {
      url: decodedUrl,
      scheme,
      organisation,
      namespace,
      id: fourthPart,
    };
    return identityUrl;
  } else if ( scheme === 'itsm' ) {
    const namedUrl: NamedUrl = {
      url: decodedUrl,
      scheme,
      organisation,
      namespace,
      name: fourthPart,
    };
    return namedUrl;
  }
  return [ `${url} does not match the expected format for NamedUrl or IdentityUrl` ];
}

export function orThrow<T> ( x: ErrorsAnd<T> ): T {
  if ( Array.isArray ( x ) ) throw new Error ( x.join ( ', ' ) );
  return x;
}
export const parseNamedUrl = ( url: string ): NamedUrl =>
  orThrow ( mapErrors ( parseUrl ( url ), ( x: NamedOrIdentityUrl ) =>
    isNamedUrl ( x ) ? x : [ `${url} is not a NamedUrl` ] ) );

export const parseIdentityUrl = ( url: string ): IdentityUrl =>
  orThrow ( mapErrors ( parseUrl ( url ), ( x: NamedOrIdentityUrl ) =>
    isIdentityUrl ( x ) ? x : [ `${url} is not a IdentityUrl` ] ) )

export function foldNamedOrIdentityUrl<T> ( namedFn: ( n: NamedUrl ) => T, identityFn: ( i: IdentityUrl ) => T, url: NamedOrIdentityUrl ): T {
  if ( isNamedUrl ( url ) ) return namedFn ( url );
  if ( isIdentityUrl ( url ) ) return identityFn ( url );
  throw new Error ( `Unexpected url type ${url}` );
}
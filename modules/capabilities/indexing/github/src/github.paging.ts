import { AccessConfig } from "@itsmworkbench/indexing";
import { PagingTc } from "@itsmworkbench/indexing";

export type GitHubPaging = {
  next?: string
}
/**
 * Parses the Link header to find the next page URL.
 * @param linkHeader The content of the Link response header.
 * @return {GitHubPaging} The GitHubPaging object with the next URL if available.
 */
export function parseGitHubLinkHeader ( json: any, linkHeader: string | null ): GitHubPaging {
  if ( !linkHeader ) return {};

  const links = linkHeader.split ( ',' ).reduce ( ( acc, link ) => {
    const parts = link.match ( /<([^>]+)>;\s*rel="([^"]+)"/ );
    if ( parts ) {
      acc[ parts[ 2 ] ] = parts[ 1 ];
    }
    return acc;
  }, {} as { [ key: string ]: string } );

  return { next: links.next };
}
export const githubAccessOptions: AccessConfig<GitHubPaging> = {
  pagingFn: parseGitHubLinkHeader
}
export const gitHubPagingTC: PagingTc<GitHubPaging> = {
  zero: () => ({}),
  hasMore: ( page ) => page.next !== undefined,
  logMsg: ( page ) => `Page: ${page.next}`
}

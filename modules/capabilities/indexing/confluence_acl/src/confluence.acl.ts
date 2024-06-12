import { fetchArrayWithPaging, FetchArrayWithPagingType, FetchFn, FetchFnOptions, FetchFnResponse, fetchOneItem, FetchOneItemType, Indexer, IndexingContext, IndexTreeNonFunctionals, SourceSinkDetails } from "@itsmworkbench/indexing";
import { flatMapK, mapK, NameAnd } from "@laoban/utils";
import { type } from "node:os";
import { withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { ConfluencePagingTC } from "@itsmworkbench/indexing_confluence";
import { removeSearchAclPrefix } from "@itsmworkbench/indexconfig";

export interface ConfluenceAclDetails extends SourceSinkDetails {
  file: string
  index: string
  spaces: string[]
  emailSuffix: string
}
export type ConfPermAll = {
  permissions: NameAnd<ConfluencePermission>
}
export type ConfluencePermission = {
  groups: string[]
  users: string[]
}

export function combineConfPermissions ( cps: ConfluencePermission[] ): ConfluencePermission {
  return {
    groups: cps.flatMap ( cp => cp.groups ),
    users: cps.flatMap ( cp => cp.users )
  }
}
export async function loadPermissions ( fetch: FetchOneItemType, headers: NameAnd<string>, details: ConfluenceAclDetails, space: string ) {
  const json = await fetch<ConfPermAll> ( `${details.baseurl}rest/extender/1.0/permission/space/${space}/getSpacePermissionActors/all`, { headers } )
  if ( !json.permissions ) throw new Error ( `Expected permisssions in response for ${space}\n${JSON.stringify ( json )}` )
  if ( typeof json.permissions !== 'object' ) throw new Error ( `Unexpected type for permissions in response for ${space}\n${JSON.stringify ( json )}` )
  const perm: ConfluencePermission = combineConfPermissions ( Object.values ( json.permissions ) )
  return perm
}
export type ConfUser = {
  name: string
}
export async function useUsers ( r: any ): Promise<ConfUser[]> {
  return r.users
}
export const groupToUsers = ( fetchArray: FetchArrayWithPagingType, headers: NameAnd<string>, details: ConfluenceAclDetails ) => async ( group: string ): Promise<string[]> => {
  const result: string[] = []
  for await ( const member of fetchArray<ConfUser> ( `${details.baseurl}rest/extender/1.0/group/getUsers/${group}`, { headers }, useUsers ) )
    result.push ( member.name )
  return result
};

async function findUserToSpaces ( fetchOne: FetchOneItemType, fetchArray: FetchArrayWithPagingType, headers: NameAnd<string>, details: ConfluenceAclDetails ): Promise<NameAnd<string[]>> {
  const result: NameAnd<string[]> = {}
  for await ( const space of (details.spaces || []) ) {
    const permissions = await loadPermissions ( fetchOne, headers, details, space )
    const usersFromGroups = await flatMapK ( permissions.groups, groupToUsers ( fetchArray, headers, details ) )
    const allUsers = [ ...new Set ( [ ...permissions.users, ...usersFromGroups ] ) ].sort ()
    for ( const user of allUsers ) {
      const adjustedUser = (user.indexOf ( '@' ) === -1 ? user + details.emailSuffix : user).toLowerCase()
      const list = result[ adjustedUser ] || []
      result[ adjustedUser ] = list
      list.push ( space )
    }
  }
  return result
}
export function convertConfDetailsToAclRecord ( index: string, user: string, spaces: string[] ) {
  return {
    _id: user,
    data: {
      groups: spaces,
      query: JSON.stringify (
        {
          "bool": {
            "filter": [
              { "term": { "_index": index } },
              { "terms": { "space": spaces } }
            ]
          }
        } )
    }
  }
}
export const indexConfluenceAcl = ( ic: IndexingContext, nfs: IndexTreeNonFunctionals, indexerFn: ( fileTemplate: string, indexId: string ) => Indexer<any> ) => {
  const nfcFetch: FetchFn = withRetry ( nfs.queryRetryPolicy, withThrottle ( nfs.queryThrottle, ic.fetch ) )
  // const nfcFetch: FetchFn = withThrottle ( nfs.indexThrottle, ic.fetch )
  const fArray: FetchArrayWithPagingType = fetchArrayWithPaging ( nfcFetch, ic.parentChildLogAndMetrics, ConfluencePagingTC, nfs.queryRetryPolicy );
  const fOne = withRetry ( nfs.queryRetryPolicy, fetchOneItem ( nfcFetch ) )

  return async ( details: ConfluenceAclDetails ) => {
    if ( details.emailSuffix === undefined ) throw new Error ( `emailSuffix for ${details.index} is required` )
    const indexer: Indexer<any> = indexerFn ( details.file, details.index )
    await indexer.start ( details.index )
    try {
      const headers = await ic.authFn ( details.auth )
      const userToSpaces = await findUserToSpaces ( fOne, fArray, headers, details )
      for ( const [ user, spaces ] of Object.entries ( userToSpaces ) ) {
        let result = convertConfDetailsToAclRecord ( removeSearchAclPrefix ( details.index ), user, spaces );
        await indexer.processLeaf ( details.index, result._id ) ( result.data )
      }
      await indexer.finished ( details.index )
    } catch ( e ) {
      await indexer.failed ( details.index, e )
    }
  };
};


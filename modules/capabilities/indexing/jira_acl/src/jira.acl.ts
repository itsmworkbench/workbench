import { ExecuteIndexOptions, fetchArrayWithPaging, FetchArrayWithPagingType, FetchFn, FetchFnOptions, fetchOneItem, Indexer, IndexingContext, IndexTreeNonFunctionals, SourceSinkDetails } from "@itsmworkbench/indexing";
import { NameAnd } from "@laoban/utils";
import { withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { ConfluencePagingTC } from "@itsmworkbench/indexing_confluence";
import { allMembersOfGroup } from "@itsmworkbench/indexing_entraid";
import { EntraIdAuthentication, removeSearchAclPrefix } from "@itsmworkbench/indexconfig";

export type GroupAndMembers = GroupAndMember[]

export type GroupAndMember = {
  groupName: string // for example JIRA_ME8_DEVELOPERS
  members: string[] // the names of the people in that group
}

export interface JiraAclDetails extends SourceSinkDetails {
  entraId: EntraIdAuthentication;
  groupMembersFile: string
  file: string
  index: string
  headers?: number
  groupColumn?: number
  memberColumn?: number
  extractGroup?: string
  projects?: string[]
}


const extractKey = ( regex: RegExp ) => ( input: string ): string[] => {
  // const regex = /^JIRA_(.*?)_/;
  const match = input.match ( regex );
  return match ? [ match[ 1 ] ] : [];
};

export type NameAndType = {
  roleId: string
  name: string
  type: string
}

async function project2NameAndType ( ic: IndexingContext, fOne: ( p1: string, p2: FetchFnOptions ) => Promise<any>, details: JiraAclDetails ) {
  const jiraAuth = await ic.authFn ( details.auth )
  const projects = details.projects.map ( s => s.toString () )
  const result: NameAnd<NameAndType[]> = {}
  for await ( const projectId of projects ) {
    const projectDetails = await fOne( `${details.baseurl}rest/api/2/project/${projectId}`, { headers: jiraAuth } )
    const key = projectDetails.key
    result[ key ] = []
    const roleNameAndUrl: NameAnd<string> = await fOne ( `${details.baseurl}rest/api/2/project/${projectId}/role`, { headers: jiraAuth } )
    // console.log('   roleNameAndUrl', JSON.stringify(roleNameAndUrl))
    for ( const roleId in roleNameAndUrl ) {
      const url = roleNameAndUrl[ roleId ]
      const roles: any = await fOne ( url, { headers: jiraAuth } )
      console.log ( projectId, roleId, '   url', url )
      const actors: any[] = roles.actors
      result[ key ].push ( ...actors.map ( actor => ({ roleId, name: actor.name, type: actor.type }) ) )
    }
  }
  return result;
}

export function extractAll ( project2Names: NameAnd<NameAndType[]>, type: string ): NameAnd<string[]> {
  const result: NameAnd<string[]> = {}
  for ( const projectId in project2Names ) {
    result[ projectId ] = project2Names[ projectId ].filter ( x => x.type === type ).map ( x => x.name )
  }
  return result
}


export const indexJiraAcl = ( nfc: IndexTreeNonFunctionals, ic: IndexingContext, indexerFn: ( fileTemplate: string, indexId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ) => {
  const nfcFetch: FetchFn = withRetry ( nfc.queryRetryPolicy, withThrottle ( nfc.queryThrottle, ic.fetch ) )
  // const nfcFetch: FetchFn = withThrottle ( nfs.indexThrottle, ic.fetch )
  const fArray: FetchArrayWithPagingType = fetchArrayWithPaging ( nfcFetch, ic.parentChildLogAndMetrics, ConfluencePagingTC, nfc.queryRetryPolicy );
  const fOne = withRetry ( nfc.queryRetryPolicy, fetchOneItem ( nfcFetch ) )
  return async ( details: JiraAclDetails ) => {
    if ( details.projects === undefined ) throw new Error ( 'No projects specified in ' + JSON.stringify ( details ) )
    const indexer: Indexer<any> = indexerFn ( details.file, details.index )
    await indexer.start ( details.index )
    const entraIdAuth = await ic.authFn ( details.entraId )
    async function calcAllUsersInGroup ( allGroups: NameAnd<string[]> ) {
      const result: NameAnd<string[]> = {}
      for await ( const projectName of Object.keys ( allGroups ) ) {
        if ( !result[ projectName ] ) result[ projectName ] = []
        for await ( const group of allGroups[ projectName ] ) {
          for await ( const member of allMembersOfGroup ( ic.fetch, entraIdAuth, ic.parentChildLogAndMetrics, group ) )
            if ( member.mail ) result[ projectName ].push ( member.mail )
            else console.error ( 'No mail for', group, JSON.stringify ( member ) )
        }
      }
      return result
    }

    async function convertToNameToProject ( allUsers: NameAnd<string[]>, allUsersInGroups: NameAnd<string[]> ) {
      const nameToProjects: NameAnd<string[]> = {}
      for await ( const projectName of Object.keys ( allUsers ) ) {
        const users = allUsers[ projectName ]
        const fromGroups = allUsersInGroups[ projectName ]
        const all = [ ...users, ...fromGroups ]
        const unique = [ ...new Set ( all ) ]
        for ( const user of unique ) {
          if ( !nameToProjects[ user ] ) nameToProjects[ user ] = []
          nameToProjects[ user ].push ( projectName )
        }
      }
      return nameToProjects;
    }
    try {
      const projectToName: NameAnd<NameAndType[]> = await project2NameAndType ( ic, fOne, details );
      console.log ( 'projectToName', JSON.stringify ( projectToName, null, 2 ) )
      const allUsers = extractAll ( projectToName, 'atlassian-user-role-actor' )
      const allGroups = extractAll ( projectToName, 'atlassian-group-role-actor' )
      console.log ( 'allUsers', JSON.stringify ( allUsers, null, 2 ) )
      console.log ( 'allGroups', JSON.stringify ( allGroups, null, 2 ) )
      const allUsersInGroups = await calcAllUsersInGroup ( allGroups )
      console.log ( 'allUsersInGroups', JSON.stringify ( allUsersInGroups, null, 2 ) )
      const nameToProjects = await convertToNameToProject ( allUsers, allUsersInGroups );
      console.log ( 'nameToProjects', nameToProjects )
      for await ( const user of Object.keys ( nameToProjects ) ) {
        const allowedKeys = nameToProjects[ user ];
        const body = {
          allowedKeys,
          query: JSON.stringify (
            {
              "bool": {
                "filter": [
                  { "term": { "_index":  removeSearchAclPrefix ( details.index ) } },
                  { "terms": { "key.keyword": allowedKeys } }
                ]
              }
            } )
        };
        await indexer.processLeaf ( details.index, user.toLowerCase () ) ( body )
      }
      await indexer.finished ( details.index )
    } catch
      ( e: any ) {
      await indexer.failed ( details.index, e )
    }
  }
}

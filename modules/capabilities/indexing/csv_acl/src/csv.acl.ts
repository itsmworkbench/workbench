import { Indexer, SourceSinkDetails } from "@itsmworkbench/indexing";
import * as fs from "fs";
import { flatMap, NameAnd } from "@laoban/utils";
import { removeSearchAclPrefix } from "@itsmworkbench/indexconfig";

export type GroupAndMembers = GroupAndMember[]

export type GroupAndMember = {
  groupName: string // for example JIRA_ME8_DEVELOPERS
  members: string[] // the names of the people in that group
}

export interface CsvAclDetails extends SourceSinkDetails {
  groupMembersFile: string
  file: string
  index: string
  headers?: number
  groupColumn?: number
  memberColumn?: number
  extractGroup?: string
}

export const convertFileToGroupAndMembers = ( details: CsvAclDetails, file: string ): GroupAndMembers => {
  const lines = file.split ( '\n' ).map ( l => l.trim () ).filter ( l => l.length > 0 );
  const groupCol = details.groupColumn ?? 0;
  const memberCol = details.memberColumn ?? 1;
  const maxColumns = Math.max ( memberCol, groupCol );
  return lines.slice ( details.headers ?? 0 ).map ( ( line, index ) => {
    const parts = line.split ( ',' );
    if ( parts.length < maxColumns + 1 ) {
      throw new Error ( `Invalid line format on line ${index}: Need ${maxColumns} but had ${parts.length}. Line was ${line}` );
    }
    const groupName = parts[ groupCol ];
    const members = parts.slice ( memberCol );
    return { groupName, members };
  } );
};
async function loadGroupAndMembers ( details: CsvAclDetails ): Promise<GroupAndMembers> {
  return convertFileToGroupAndMembers ( details, await fs.promises.readFile ( details.groupMembersFile ).then ( b => b.toString ( 'utf8' ) ) )
}
export type MemberAndGroups = NameAnd<string[]>
export function convertGroupAndMembersToMemberAndGroups ( gms: GroupAndMembers ): MemberAndGroups {
  const memberGroupsMap: MemberAndGroups = {};
  gms.forEach ( group =>
    group.members.forEach ( member => {
      if ( !memberGroupsMap[ member ] ) memberGroupsMap[ member ] = [];
      memberGroupsMap[ member ].push ( group.groupName );
    } ) );
  return memberGroupsMap;
}
export type AclStructure = {
  _id: string,
  body: { allowed_keys: string[] }
}
const extractKey = ( regex: RegExp ) => ( input: string ): string[] => {
  // const regex = /^JIRA_(.*?)_/;
  const match = input.match ( regex );
  return match ? [ match[ 1 ] ] : [];
};
export function convertMemberAndGroupsToAclStructure ( index: string, extractGroup: RegExp, mag: MemberAndGroups ): AclStructure[] {
  return Object.keys ( mag ).map ( member => {
    const result = {
      _id: member,
      body: {
        "allowed_keys": mag[ member ],
        query: JSON.stringify (
          {
            "bool": {
              "filter": [
                { "term": { "_index": index } },
                { "terms": { "key.keyword": flatMap ( mag[ member ], extractKey ( extractGroup ) ) } }
              ]
            }
          } )
      }
    };
    return result;
  } );
}

export const indexCsvAcl = ( indexerFn: ( fileTemplate: string, indexId: string ) => Indexer<any> ) => async ( details: CsvAclDetails ) => {
  const indexer: Indexer<any> = indexerFn ( details.file, details.index )
  await indexer.start ( details.index )
  try {
    const groupAndMembers = await loadGroupAndMembers ( details )
    const membersAndGroups = convertGroupAndMembersToMemberAndGroups ( groupAndMembers )
    const extractGroup = new RegExp ( details.extractGroup || '(.*)' )
    const aclStructures = convertMemberAndGroupsToAclStructure ( removeSearchAclPrefix ( details.index ), extractGroup, membersAndGroups )
    console.log ( JSON.stringify ( aclStructures, null, 2 ) )
    for ( const a of aclStructures )
      await indexer.processLeaf ( details.index, a._id.toLowerCase () ) ( a.body )
    await indexer.finished ( details.index )
  } catch ( e ) {
    await indexer.failed ( details.index, e )
  }
};
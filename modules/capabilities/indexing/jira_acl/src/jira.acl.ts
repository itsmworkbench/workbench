import { Indexer, SourceSinkDetails } from "@itsmworkbench/indexing";
import * as fs from "fs";
import { NameAnd } from "@laoban/utils";

export type GroupAndMembers = GroupAndMember[]

export type GroupAndMember = {
  groupId: string // for example 0a3324-234345-12312312
  groupName: string // for example JIRA_ME8_DEVELOPERS
  members: string[] // the names of the people in that group
}

export interface JiraAclDetails extends SourceSinkDetails {
  groupMembersFile: string
  file: string
  index: string
  findkey?: string
}

export function convertFileToGroupAndMembers ( file: string ): GroupAndMembers {
  const lines = file.split ( '\n' ).map ( l => l.trim () ).filter ( l => l.length > 0 );
  return lines.slice ( 1 ).map ( ( line, index ) => {
    const parts = line.split ( ',' );
    if ( parts.length < 3 ) {
      throw new Error ( `Invalid line format on line ${index}: ${line}` );
    }
    const groupId = parts[ 0 ];
    const groupName = parts[ 1 ];
    const members = parts.slice ( 2 );
    return { groupId, groupName, members };
  } );
}
async function loadGroupAndMembers ( details: JiraAclDetails ): Promise<GroupAndMembers> {
  return convertFileToGroupAndMembers ( await fs.promises.readFile ( details.groupMembersFile ).then ( b => b.toString ( 'utf8' ) ) )
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

export function convertMemberAndGroupsToAclStructure ( mag: MemberAndGroups ): AclStructure[] {
  return Object.keys ( mag ).map ( member => ({
    _id: member,
    body: {
      "allowed_keys": mag[ member ]
    }
  }) )
}
export const makeAclIndexForGroupAndMember = ( indexerFn: ( fileTemplate: string, indexId: string ) => Indexer<any> ) => async ( details: JiraAclDetails ) => {
  const indexer: Indexer<any> = indexerFn ( details.file, details.index )
  await indexer.start ( details.index )
  try {
    const groupAndMembers = await loadGroupAndMembers ( details )
    const membersAndGroups = convertGroupAndMembersToMemberAndGroups ( groupAndMembers )
    const aclStructures = convertMemberAndGroupsToAclStructure ( membersAndGroups )
    console.log ( JSON.stringify ( aclStructures, null, 2 ) )
    for ( const a of aclStructures )
      await indexer.processLeaf ( details.index, a._id ) ( a.body )
    await indexer.finished ( details.index )
  } catch ( e ) {
    await indexer.failed ( details.index, e )
  }
};
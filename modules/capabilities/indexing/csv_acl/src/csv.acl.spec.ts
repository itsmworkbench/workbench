import { AclStructure, convertFileToGroupAndMembers, convertGroupAndMembersToMemberAndGroups, convertMemberAndGroupsToAclStructure, CsvAclDetails, GroupAndMembers, MemberAndGroups } from "./csv.acl";

const details: CsvAclDetails = {
  groupMembersFile: 'someFile',
  memberColumn: 2,
  groupColumn: 1,
  extractGroup: 'JIRA_(.*?)_',
  file: 'someFile',
  index: 'someIndex',
  baseurl: 'someUrl',
  auth: undefined as any

}
describe ( 'convertFileToGroupAndMembers', () => {
  test ( 'should convert a valid file string to GroupAndMembers array', () => {
    const file = 'groupId,groupname,member1,member2\n' + `0a3324-234345-12312312,JIRA_ME8_DEVELOPERS,John Doe,Jane Doe\n` +
      `1b4325-345456-23423423,JIRA_ME8_TESTERS,Alice,Bob`;

    const expectedOutput: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe' ]
      },
      {
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'Alice', 'Bob' ]
      }
    ];

    const result = convertFileToGroupAndMembers ( details, file );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle an empty file string', () => {
    const file = '';
    const expectedOutput: GroupAndMembers = [];
    const result = convertFileToGroupAndMembers ( details, file );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should throw an error for invalid line format', () => {
    const file = 'groupId,groupname,member1,member2\n' +
      `0a3324-234345-12312312,JIRA_ME8_DEVELOPERS\n` + // Invalid line format
      `1b4325-345456-23423423,JIRA_ME8_TESTERS,Alice,Bob`;

    expect ( () => convertFileToGroupAndMembers ( details, file ) ).toThrow ( 'Invalid line format on line 0: 0a3324-234345-12312312,JIRA_ME8_DEVELOPERS' );
  } );

  test ( 'should handle file with extra commas in member names', () => {
    const file = 'groupId,groupname,member1,member2\n' +
      `0a3324-234345-12312312,JIRA_ME8_DEVELOPERS,John Doe,Jane Doe\n` +
      `1b4325-345456-23423423,JIRA_ME8_TESTERS,Alice,Bob,Bob Jr.`;

    const expectedOutput: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe' ]
      },
      {
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'Alice', 'Bob', 'Bob Jr.' ]
      }
    ];

    const result = convertFileToGroupAndMembers ( details, file );
    expect ( result ).toEqual ( expectedOutput );
  } );
} );


describe ( 'convertGroupAndMembersToMemberAndGroups', () => {
  test ( 'should convert GroupAndMembers to MemberAndGroups correctly', () => {
    const gms: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe' ]
      },
      {
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'Alice', 'John Doe' ]
      }
    ];

    const expectedOutput = {
      'John Doe': [ 'JIRA_ME8_DEVELOPERS', 'JIRA_ME8_TESTERS' ],
      'Jane Doe': [ 'JIRA_ME8_DEVELOPERS' ],
      'Alice': [ 'JIRA_ME8_TESTERS' ]
    };

    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle an empty GroupAndMembers array', () => {
    const gms: GroupAndMembers = [];
    const expectedOutput = {};
    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle groups with no members', () => {
    const gms: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: []
      }
    ];

    const expectedOutput = {};
    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle members with multiple group memberships', () => {
    const gms: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe' ]
      },
      {
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'John Doe' ]
      }
    ];

    const expectedOutput = {
      'John Doe': [ 'JIRA_ME8_DEVELOPERS', 'JIRA_ME8_TESTERS' ]
    };

    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle multiple groups with multiple members', () => {
    const gms: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe', 'Alice' ]
      },
      {
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'John Doe', 'Alice', 'Bob' ]
      },
      {
        groupName: 'JIRA_ME8_MANAGERS',
        members: [ 'Alice', 'Bob', 'Charlie' ]
      }
    ];

    const expectedOutput = {
      'John Doe': [ 'JIRA_ME8_DEVELOPERS', 'JIRA_ME8_TESTERS' ],
      'Jane Doe': [ 'JIRA_ME8_DEVELOPERS' ],
      'Alice': [ 'JIRA_ME8_DEVELOPERS', 'JIRA_ME8_TESTERS', 'JIRA_ME8_MANAGERS' ],
      'Bob': [ 'JIRA_ME8_TESTERS', 'JIRA_ME8_MANAGERS' ],
      'Charlie': [ 'JIRA_ME8_MANAGERS' ]
    };

    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );
} );

describe ( 'convertGroupAndMembersToMemberAndGroups', () => {
  test ( 'should convert GroupAndMembers to MemberAndGroups correctly', () => {
    const gms: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe' ]
      },
      {
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'Alice', 'John Doe' ]
      }
    ];

    const expectedOutput: MemberAndGroups = {
      'John Doe': [ 'JIRA_ME8_DEVELOPERS', 'JIRA_ME8_TESTERS' ],
      'Jane Doe': [ 'JIRA_ME8_DEVELOPERS' ],
      'Alice': [ 'JIRA_ME8_TESTERS' ]
    };

    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle an empty GroupAndMembers array', () => {
    const gms: GroupAndMembers = [];
    const expectedOutput: MemberAndGroups = {};
    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle groups with no members', () => {
    const gms: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: []
      }
    ];

    const expectedOutput: MemberAndGroups = {};
    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle members with multiple group memberships', () => {
    const gms: GroupAndMembers = [
      {
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe' ]
      },
      {
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'John Doe' ]
      }
    ];

    const expectedOutput: MemberAndGroups = {
      'John Doe': [ 'JIRA_ME8_DEVELOPERS', 'JIRA_ME8_TESTERS' ]
    };

    const result = convertGroupAndMembersToMemberAndGroups ( gms );
    expect ( result ).toEqual ( expectedOutput );
  } );
} );

describe ( 'convertMemberAndGroupsToAclStructure', () => {
  test ( 'should convert MemberAndGroups to AclStructure correctly', () => {
    const mag: MemberAndGroups = {
      'John Doe': [ 'JIRA_ME8_DEVELOPERS', 'JIRA_ME8_TESTERS' ],
      'Jane Doe': [ 'JIRA_ME8_DEVELOPERS' ],
      'Alice': [ 'JIRA_ME8_TESTERS' ]
    };

    const result = convertMemberAndGroupsToAclStructure ( 'someIndex', new RegExp ( details.extractGroup ), mag );
    expect ( result ).toEqual ( [
      {
        "_id": "John Doe",
        "body": {
          "allowed_keys": [
            "JIRA_ME8_DEVELOPERS",
            "JIRA_ME8_TESTERS"
          ],
          "query": "{\"bool\":{\"filter\":[{\"term\":{\"_index\":\"someIndex\"}},{\"terms\":{\"key.keyword\":[\"ME8\",\"ME8\"]}}]}}"
        }
      },
      {
        "_id": "Jane Doe",
        "body": {
          "allowed_keys": [
            "JIRA_ME8_DEVELOPERS"
          ],
          "query": "{\"bool\":{\"filter\":[{\"term\":{\"_index\":\"someIndex\"}},{\"terms\":{\"key.keyword\":[\"ME8\"]}}]}}"
        }
      },
      {
        "_id": "Alice",
        "body": {
          "allowed_keys": [
            "JIRA_ME8_TESTERS"
          ],
          "query": "{\"bool\":{\"filter\":[{\"term\":{\"_index\":\"someIndex\"}},{\"terms\":{\"key.keyword\":[\"ME8\"]}}]}}"
        }
      }
    ] );
  } );

  test ( 'should handle an empty MemberAndGroups object', () => {
    const mag: MemberAndGroups = {};
    const expectedOutput: AclStructure[] = [];
    const result = convertMemberAndGroupsToAclStructure ( 'someIndex', new RegExp ( details.extractGroup ), mag );
    expect ( result ).toEqual ( expectedOutput );
  } );
} );

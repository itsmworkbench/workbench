import { AclStructure, convertFileToGroupAndMembers, convertGroupAndMembersToMemberAndGroups, convertMemberAndGroupsToAclStructure, GroupAndMembers, MemberAndGroups } from "./jira.acl";

describe ( 'convertFileToGroupAndMembers', () => {
  test ( 'should convert a valid file string to GroupAndMembers array', () => {
    const file = 'groupId,groupname,member1,member2\n' + `0a3324-234345-12312312,JIRA_ME8_DEVELOPERS,John Doe,Jane Doe\n` +
      `1b4325-345456-23423423,JIRA_ME8_TESTERS,Alice,Bob`;

    const expectedOutput: GroupAndMembers = [
      {
        groupId: '0a3324-234345-12312312',
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe' ]
      },
      {
        groupId: '1b4325-345456-23423423',
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'Alice', 'Bob' ]
      }
    ];

    const result = convertFileToGroupAndMembers ( file );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle an empty file string', () => {
    const file = '';
    const expectedOutput: GroupAndMembers = [];
    const result = convertFileToGroupAndMembers ( file );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should throw an error for invalid line format', () => {
    const file = 'groupId,groupname,member1,member2\n' +
      `0a3324-234345-12312312,JIRA_ME8_DEVELOPERS\n` + // Invalid line format
      `1b4325-345456-23423423,JIRA_ME8_TESTERS,Alice,Bob`;

    expect ( () => convertFileToGroupAndMembers ( file ) ).toThrow ( 'Invalid line format on line 0: 0a3324-234345-12312312,JIRA_ME8_DEVELOPERS' );
  } );

  test ( 'should handle file with extra commas in member names', () => {
    const file = 'groupId,groupname,member1,member2\n' +
      `0a3324-234345-12312312,JIRA_ME8_DEVELOPERS,John Doe,Jane Doe\n` +
      `1b4325-345456-23423423,JIRA_ME8_TESTERS,Alice,Bob,Bob Jr.`;

    const expectedOutput: GroupAndMembers = [
      {
        groupId: '0a3324-234345-12312312',
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe' ]
      },
      {
        groupId: '1b4325-345456-23423423',
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'Alice', 'Bob', 'Bob Jr.' ]
      }
    ];

    const result = convertFileToGroupAndMembers ( file );
    expect ( result ).toEqual ( expectedOutput );
  } );
} );


describe ( 'convertGroupAndMembersToMemberAndGroups', () => {
  test ( 'should convert GroupAndMembers to MemberAndGroups correctly', () => {
    const gms: GroupAndMembers = [
      {
        groupId: '0a3324-234345-12312312',
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe' ]
      },
      {
        groupId: '1b4325-345456-23423423',
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
        groupId: '0a3324-234345-12312312',
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
        groupId: '0a3324-234345-12312312',
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe' ]
      },
      {
        groupId: '1b4325-345456-23423423',
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
        groupId: '0a3324-234345-12312312',
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe', 'Alice' ]
      },
      {
        groupId: '1b4325-345456-23423423',
        groupName: 'JIRA_ME8_TESTERS',
        members: [ 'John Doe', 'Alice', 'Bob' ]
      },
      {
        groupId: '2c5436-456567-34534534',
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
        groupId: '0a3324-234345-12312312',
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe', 'Jane Doe' ]
      },
      {
        groupId: '1b4325-345456-23423423',
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
        groupId: '0a3324-234345-12312312',
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
        groupId: '0a3324-234345-12312312',
        groupName: 'JIRA_ME8_DEVELOPERS',
        members: [ 'John Doe' ]
      },
      {
        groupId: '1b4325-345456-23423423',
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

    const expectedOutput: AclStructure[] = [
      //fill in from failure. Check first
    ];

    const result = convertMemberAndGroupsToAclStructure ( mag );
    expect ( result ).toEqual ( expectedOutput );
  } );

  test ( 'should handle an empty MemberAndGroups object', () => {
    const mag: MemberAndGroups = {};
    const expectedOutput: AclStructure[] = [];
    const result = convertMemberAndGroupsToAclStructure ( mag );
    expect ( result ).toEqual ( expectedOutput );
  } );
} );

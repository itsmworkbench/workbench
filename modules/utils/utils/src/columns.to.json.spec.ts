import { findColumnStartIndexes, parseColumnsToJSON } from "./columns.to.json";

describe ( 'findColumnStartIndexes', () => {
  it ( 'correctly identifies the start of each column based on corrected positions', () => {
    const header = 'Environment Type     Host      Port Database Schema UserName Connection';
    const expectedIndexes = [ 0, 12, 21, 31, 36, 45, 52, 61 ];
    expect ( findColumnStartIndexes ( header ) ).toEqual ( expectedIndexes );
  } );

  // Add more test cases as needed
} );
describe ( 'parseColumnsToJSON', () => {
  it ( 'correctly parses input string to JSON objects, representing missing values as undefined', () => {
    const input = `Environment Type     Host      Port Database Schema UserName Connection
dev         postgres localhost 5432 postgres public phil
oracle      oracle                           PHIL   phil     localhost/xepdb1`;

    const expected = [
      {
        "Environment": "dev",
        "Type": "postgres",
        "Host": "localhost",
        "Port": "5432",
        "Database": "postgres",
        "Schema": "public",
        "UserName": "phil",
      },
      {
        "Environment": "oracle",
        "Type": "oracle",
        "Schema": "PHIL",
        "UserName": "phil",
        "Connection": "localhost/xepdb1"
      }
    ];

    expect ( parseColumnsToJSON ( input ) ).toEqual ( expected );
  } );
} );

import { NameAnd } from "@laoban/utils";

export function findColumnStartIndexes ( header: string ): number[] {
  const startIndexes: number[] = [];
  let isPreviousCharWhitespace = true;

  for ( let i = 0; i < header.length; i++ ) {
    if ( header[ i ] !== ' ' && isPreviousCharWhitespace ) {
      startIndexes.push ( i );
      isPreviousCharWhitespace = false;
    } else if ( header[ i ] === ' ' ) {
      isPreviousCharWhitespace = true;
    }
  }

  return startIndexes;
}
export function parseColumnsToJSON ( input: string, colsToDrop: number = 0 ): NameAnd<string>[] {
  // Split the input into lines
  const lines = input.split ( '\n' ).filter ( line => line.trim ().length > 0 );

  // Determine the start of each column from the header row
  const columnStartIndexes = findColumnStartIndexes ( lines[ colsToDrop ] );
  // Extract column names from the header row
  const columnNames = columnStartIndexes.map ( ( startIdx, index ) => {
    // The end index is the start of the next column or the end of the string
    const endIdx = columnStartIndexes[ index + 1 ] || lines[ colsToDrop ].length;
    return lines[ colsToDrop ].substring ( startIdx, endIdx ).trim ();
  } );

  // Parse each row into a JSON object
  const jsonObjects = lines.slice ( colsToDrop + 1 ).map ( row => {
    const jsonObject: any = {};
    columnStartIndexes.forEach ( ( startIdx, index ) => {
      // Define the end index for substring extraction
      const endIdx = columnStartIndexes[ index + 1 ] || row.length;
      // Extract and trim the value from the row
      const value = row.substring ( startIdx, endIdx ).trim ();
      // Assign the value to the corresponding column name in the JSON object
      // If the value is an empty string, assign undefined
      jsonObject[ columnNames[ index ] ] = value === '' ? undefined : value;
    } );
    return jsonObject;
  } );

  return jsonObjects;
}

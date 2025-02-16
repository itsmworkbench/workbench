import {NameAnd} from "./name.and";


export function lowercaseFirstLetter ( str: string ): string {
  return str.charAt ( 0 ).toLowerCase () + str.slice ( 1 );
}
export function uppercaseFirstLetter ( str: string ): string {
  return str.charAt ( 0 ).toUpperCase () + str.slice ( 1 );
}
export function toCamelCase ( str: string ): string {
  return str
    // First, handle the start of the string separately if it's uppercase
    .replace ( /^([A-Z])/, ( firstChar ) => firstChar.toLowerCase () )
    // Then, transform the rest of the string
    .replace ( /[^a-zA-Z0-9]+(.)/g, ( match, chr ) => chr.toUpperCase () );
}

/**
 * Converts a camelCase string to a series of words with the first letter capitalized.
 * Example: "thisText" => "This Text"
 *
 * @param input - The camelCase string to convert.
 * @returns The formatted string.
 */
export function camelCaseToWords(input: string): string {
  if (!input) return input
  return input
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before uppercase letters preceded by lowercase letters
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // Handle sequences of uppercase letters
      .replace(/([a-zA-Z])([0-9])/g, '$1 $2') // Insert space before numbers following letters
      .replace(/([0-9])([a-zA-Z])/g, '$1 $2') // Insert space before letters following numbers
      .split(' ') // Split into words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(' ') // Join words back into a string
      .trim(); // Trim leading and trailing spaces
}


export function escapeForSql ( str: string ): string {
  // Replace single quotes with two single quotes for SQL escaping
  return str.replace ( /'/g, "''" );
}

export interface HasEscape {
  escape?: boolean;
}
export function escapeSqlParameters ( sql: string, lookupMap: Record<string, HasEscape> ): string {
  // Regular expression to find all instances of `:parameterName`
  const parameterRegex = /:([\w.]+)/g;

  if (lookupMap === undefined) throw new Error('lookupMap is undefined');
  // Replace function to handle each match
  const replacer = ( match: string, paramName: string ): string => {
    // Check if the parameter needs quotes
    if ( lookupMap[ paramName ]?.escape ) {
      // Add quotes around the parameter placeholder
      return `'${match}'`;
    } else {
      // Leave the parameter placeholder as is
      return match;
    }
  };

  // Replace each parameter in the SQL string according to the lookup map
  return sql?.replace ( parameterRegex, replacer );
}


export function extractSqlString ( query?: string ): string[] {
  if ( !query ) return [];

  // Regular expression to match parameters (including those with dots)
  const parameterRegex = /:([a-zA-Z0-9._]+)/g;
  let match: RegExpExecArray | null;
  const parameters: string[] = [];

  // Use a loop to find all matches in the query string
  while ( (match = parameterRegex.exec ( query )) !== null ) {
    // Add the matched parameter name to the list, excluding the leading colon
    parameters.push ( match[ 1 ] );
  }

  return parameters;
}
export function splitAndCapitalize(input: string|undefined): string {
  if (input === undefined) return '';
  const withSpaces = input.replace(/([A-Z])/g, ' $1').trim();
  const result = withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  return result;
}
export function fullExtension ( path: string ): string {
  const index = path.indexOf ( '.' );
  return index === -1 ? '' : path.slice ( index+1 );

}

export function simpleTemplate(template: string, data: NameAnd<any>): string|undefined {
  if (template === undefined) return undefined
  if (data === undefined) return template
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    if (key in data) {
      return String(data[key]);
    }
    return match; // Return the original match if no corresponding key is found
  });
}
export function withoutFirstSegment ( path: string ): string {
  if (path === undefined) return '';
  const index = path.indexOf ( '/' );
  return index === -1 ? '' : path.slice ( index+1 );
}


export const ellipsesInMiddle = (
    text: string,
    maxLength: number,
    ellipsis = "..."
): string => {
  if (text.length <= maxLength) return text;

  const ellipsisLength = ellipsis.length;
  const partLength = Math.floor((maxLength - ellipsisLength) / 2);

  // Ensure we don't cut too much when maxLength is small
  if (partLength <= 0) return ellipsis;

  const start = text.slice(0, partLength);
  const end = text.slice(-partLength);

  return `${start}${ellipsis}${end}`;
};


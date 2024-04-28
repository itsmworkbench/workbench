export function escapeRegExp ( string: string ) {
  // console.log('escapeRegExp', string, typeof string);
  const asString = string.toString ()
  let result = asString.replace ( /[.*+?^${}()|[\]\\]/g, '\\$&' );// $& means the whole matched string
  // console.log('escapeRegExp -asstring', asString, typeof asString, 'result', result);
  return result;
}

export function reverseTemplate ( inputString: string, variables: Record<string, string> ): string {
  if ( inputString === undefined ) return undefined;
  let template = inputString;
  for ( const varName in variables ) {
    const varValue = variables[ varName ];
    try {
      // console.log(`Input [${inputString}]\n${varName}:${JSON.stringify ( varValue )} --- ${typeof varValue}\n${JSON.stringify ( variables )}`)
      const escapedVarValue = escapeRegExp ( varValue.toString () );
      const regex = new RegExp ( escapedVarValue, 'g' );
      template = template.replace ( regex, `\${${varName}}` );
    } catch ( e ) {
      throw new Error ( `${e}\nInput [${inputString}]\n${varName}:${JSON.stringify ( varValue )} --- ${typeof varValue}\n${JSON.stringify ( variables )}` )
    }
  }
  console.log ( 'reverseTemplate', inputString, variables, template )
  return template;
}

import { deepCombineTwoObjects, ErrorsAnd, hasErrors, NameAnd } from "@laoban/utils";
import { findIdKeyAndPath } from "@intellimaintain/idstore";
import { isJsonPrimitive, JSONObject, transformKeysToCamelCase } from "@intellimaintain/utils";
import { toCamelCase } from "@intellimaintain/utils/dist/src/strings";

export type Variables = {
  variables: JSONObject
  errors: string[]

}
export type ExtractVariablesFn<T> = ( soFar: JSONObject, t: T ) => ErrorsAnd<Variables>

export type VariablesExtractor = NameAnd<ExtractVariablesFn<any>>


export function extractVariablesFrom ( ve: VariablesExtractor, id: string, soFar: JSONObject, t: any ): Variables {
  try {
    const { key } = findIdKeyAndPath ( id );
    const v = ve[ key ]
    if ( v === undefined )
      return { variables: {}, errors: [ `No extractor for idtype ${key} in id ${id} . Legal values are ${Object.keys ( ve ).join ( ', ' )}` ] }
    let result: ErrorsAnd<Variables> = v ( soFar, t );
    if ( hasErrors ( result ) ) return { variables: {}, errors: result }
    return result
  } catch ( e ) {
    return { variables: {}, errors: [ e.message ] }
  }
}


//This is mostly used for 'environment'. It gets all the name/values and then combines it with the child indexed by the key (e.g. environemnt)
//In this example section would be 'Environments' and key would be 'environment'
export function findRelevant ( soFar: NameAnd<string>, section: string, key: string, t: any ): NameAnd<string> {
  const foundKey = soFar[ key ] // now do we know what the environment is?
  console.log ( 'findRelevant', 'foundKey', key, foundKey )
  if ( foundKey === undefined ) return t
  const cleanedKey = toCamelCase ( foundKey )
  console.log ( 'findRelevant', 'cleanedKey', cleanedKey )
  const foundSection = t[ section ] // i.e. are there any 'Environments' in the t
  console.log ( 'findRelevant', 'foundSection', foundSection )
  if ( foundSection === undefined ) return t

  const foundRelevant = foundSection[ cleanedKey ] // look up the found environment in the Environments

  console.log ( 'findRelevant', 'foundRelevant', foundRelevant )
  let result = deepCombineTwoObjects ( t, foundRelevant );
  console.log ( 'findRelevant', 'result', result )
  return result
}

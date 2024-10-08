import { findIdKeyAndPath, PartialFunctionK, transformKeysToCamelCase } from "@itsmworkbench/utils";
import { YamlCapability } from "@itsmworkbench/yaml";

import { ErrorsAnd, mapErrors } from "@laoban/utils";

export interface BaseMessage {
  type: string
  who: string
}
export interface Message extends BaseMessage {
  type: 'message'
  message: string
}
export function isMessage ( message: BaseMessage | undefined ): message is Message {
  return message?.type === 'message'
}

export type ChatDisplayData<T> = {
  type: string
  data?: T
}
export type Conversation = {
  messages: BaseMessage[]
  chat: ChatDisplayData<any>
  message?: string
}

export type QuestionPFK<S> = PartialFunctionK<S, ChatDisplayData<any>>

export const camelCaseAndIdYamlParser = ( yaml: YamlCapability ) => <T> ( id: string, s: string ): ErrorsAnd<T> => {
  let json = yaml.parser ( s );
  console.log ( 'id', id, 'json', json )
  return mapErrors ( json, ( doc: any ) => {
    let withKeys: any = transformKeysToCamelCase ( doc );
    let result = { id, ...withKeys };
    console.log ( 'doc', doc )
    console.log ( 'withKeys', withKeys )
    console.log ( 'result', result )
    return result;
  } );
}


export const camelCaseAndIdAndNameParser = ( yaml: YamlCapability ) => ( id: string, s: string ) => {
  return mapErrors ( yaml.parser ( s ), input => {
    const doc = transformKeysToCamelCase<any> ( input )
    const { key, path: name } = findIdKeyAndPath ( id );
    return { id, name, ...doc }
  } )
}
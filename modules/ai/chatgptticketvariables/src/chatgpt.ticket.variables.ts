import { AiTicketVariablesFn } from "@itsmworkbench/ai_ticketvariables";

//in root directory
//npm i -g laoban
// laoban update
// yarn
// laoban compile <-- this will fail 5 mins the first time
// laoban compile <-- this will be ok.
//dependecies go into package.details.json
//after changing the package.details.json, you need to run laoban ypdate followed by yarn. (<1 min)  Don't need to call the compile code again


export const clientSecret = process.env['CHATGPT_CLIENT_SECRET']

export const chatgptTicketVariables: AiTicketVariablesFn = async (ticket: string) => {
  return {b:"2",c:"3"}

}
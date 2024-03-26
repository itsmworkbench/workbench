import { AI, AIEmailsFn, AIKnownTicketVariablesFn, AiTicketVariablesFn, EmailResult, TicketVariables } from "@itsmworkbench/ai";

export type ApiClientTicketVariablesConfig = {
  url: string
}

export const apiClientForTicketVariables = ( { url }: ApiClientTicketVariablesConfig ): AiTicketVariablesFn => async ( ticket: string ): Promise<TicketVariables> => {
  const response = await fetch ( url + "variables", { method: 'POST', body: ticket, headers: { 'Content-Type': 'text/plain' } } )
  if ( response.status < 400 ) return response.json ()
  let errorResult: TicketVariables = { error: 'Error fetching ticket variables from server', status: response.status.toString (), statusText: response.statusText, text: await response.text () };
  return errorResult
}
export const apiClientForKnownTicketVariables = ( { url }: ApiClientTicketVariablesConfig ): AIKnownTicketVariablesFn => async ( ticket: string , attributes: string[]): Promise<TicketVariables> => {
  const response = await fetch ( url + "knownvariables", { method: 'POST', body: JSON.stringify({ticket, attributes}), headers: { 'Content-Type': 'application/json' } } )
  if ( response.status < 400 ) return response.json ()
  let errorResult: TicketVariables = { error: 'Error fetching ticket variables from server', status: response.status.toString (), statusText: response.statusText, text: await response.text () };
  return errorResult
}
export const apiClientForEmail = ( { url }: ApiClientTicketVariablesConfig ): AIEmailsFn => async ( mailData ): Promise<EmailResult> => {
  const response = await fetch ( url + "email", { method: 'POST', body: JSON.stringify ( mailData ), headers: { 'Content-Type': 'application/json' } } )
  if ( response.status < 400 ) return response.json ()
  return { error: { msg: 'Error fetching ticket variables from server', status: response.status.toString (), statusText: response.statusText, text: await response.text () } }
}
export const apiClientForAi = ( { url }: ApiClientTicketVariablesConfig ): AI => {
  return {
    emails: apiClientForEmail ( { url } ),
    knownVariables: apiClientForKnownTicketVariables ( { url } ),
    variables: apiClientForTicketVariables ( { url } )
  }
}
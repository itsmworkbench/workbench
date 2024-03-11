import { AiTicketVariablesFn, TicketVariables } from "@itsmworkbench/ai_ticketvariables";

export type ApiClientTicketVariablesConfig = {
  url: string
}

export const apiClientForTicketVariables = ( { url }: ApiClientTicketVariablesConfig ): AiTicketVariablesFn => async ( ticket: string ): Promise<TicketVariables> => {
  const response = await fetch ( url, { method: 'POST', body: ticket, headers: { 'Content-Type': 'text/plain' } } )
  if ( response.status < 400 ) return response.json ()
  return { error: 'Error fetching ticket variables from server', status: response.status.toString (), statusText: response.statusText, text: await response.text () }
}
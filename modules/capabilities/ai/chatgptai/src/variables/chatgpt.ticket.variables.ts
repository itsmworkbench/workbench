import { AIKnownTicketVariablesFn, AiTicketVariablesFn, TicketVariables } from "@itsmworkbench/ai";
import { NameAnd } from "@laoban/utils";
import fetch from 'node-fetch'

export const clientSecret = process.env[ 'CHATGPT_CLIENT_SECRET' ]

export type OpenAiMessage = {
  role: string
  content: string
}
export async function getResponse ( messages: OpenAiMessage[] ) {
  try {

    const response = await fetch ( 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clientSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify ( {
        model: 'gpt-3.5-turbo',

        messages,
        temperature: 0.7
      } )
    } );
    if ( response.ok ) {
      const json = await response.json ();
      let aiResponse = json.choices[ 0 ]?.message?.content;
      console.log ( 'AI response:', aiResponse );
      return aiResponse
    }
    throw new Error ( `Error in AI completion request: ${response.status}\n${await response.text ()}` );
  } catch ( error: any ) {
    console.error ( 'Error in AI completion request:', error );

    if ( error.response ) {
      console.error ( 'Error response status:', error.response.status );
      console.error ( 'Error response data:', error.response.data );
    }
    throw error;
  }
}

function removeUnnecessaryQuotes(input: string): string {
  return input.replace(/(['"])(.*?)\1/g, (match, quote, content) => {
    // Check if the content is alphanumeric (or if you want to add specific validations, you can modify this check)
    if (quote === quote) {
      return content; // Remove the quotes and return the content
    }
    return match; // If quotes don't match, return the original match
  });
}



function cleanAttributeValue ( match: string ): string | number {
  let start = match.trim ();
  const result = removeUnnecessaryQuotes ( start );
  const resultAsNum = Number.parseFloat ( result )
  if ( !isNaN ( resultAsNum ) ) return resultAsNum
  return result === start ? result : cleanAttributeValue ( result );
}
export const chatgptKnownTicketVariables: AIKnownTicketVariablesFn = async ( ticket: string, attributes: string[] ): Promise<TicketVariables> => {
  // Craft a detailed prompt with attributes included for comparison
  let attributesList = attributes.map ( attr => `- ${attr}` ).join ( '\n' );
  // return undefined?
  const systemPrompt = `You are provided with a text of an ITSM work ticket. 
  Below is a list of specific attributes. For each attribute, compare it against the ticket text. 
  If the attribute is present, return its value. 
  The result is yaml
  It is really important that if the value is a number (even a floating point number) please don't put any quotes around it
  If it is not found, indicate TypeScript type "undefined". 
  \n\nAttributes:\n${attributesList}\n\nTicket Text:\n${ticket}\n\n
  For each attribute listed above, indicate its status based on the ticket text.`;

  console.log ( 'Processing ticket for known variables:', ticket );
  console.log ( clientSecret )
  const aiResponse = await getResponse ( [ {
    role: 'system', content: systemPrompt
  } ] )
  console.log ( 'AI response:', aiResponse );
  return attributes.reduce<NameAnd<string | number>> ( ( acc, attr ) => {
    // This regex looks for the attribute followed by any text until a newline or the response end
    const regex = new RegExp ( `${attr}[:]?\\s*([^\\n]+)`, 'i' );
    const match = aiResponse?.match ( regex );

    acc[ attr ] = match && match[ 1 ] ? cleanAttributeValue ( match[ 1 ] ) : "Attribute not found";
    return acc;
  }, {} );


};


export const chatgptTicketVariables: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
  const systemPrompt = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it. 
  Return these variables only as in JSON format. If a value is a number please don't put any quotes around it.`;
  console.log ( 'chat gpt ticket variables', ticket )
  let messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: ticket
    },

  ];
  const aiResponse = await getResponse ( messages );
  console.log ( aiResponse );

  return JSON.parse ( aiResponse );
};


export const generalChat: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
  return {} as TicketVariables;
}

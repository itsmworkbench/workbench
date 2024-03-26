import {AIKnownTicketVariablesFn, AiTicketVariablesFn, TicketVariables} from "@itsmworkbench/ai_ticketvariables";
import {OpenAI} from "openai";

export const clientSecret = process.env[ 'CHATGPT_CLIENT_SECRET' ]

const openai = new OpenAI ( {
  apiKey: clientSecret,
} );

export const chatgptKnownTicketVariables: AIKnownTicketVariablesFn = async (ticket: string, attributes: string[]): Promise<TicketVariables> => {
  // Craft a detailed prompt with attributes included for comparison
  let attributesList = attributes.map(attr => `- ${attr}`).join('\n');
  // return undefined?
  const systemPrompt = `You are provided with a text of an ITSM work ticket. 
  Below is a list of specific attributes. For each attribute, compare it against the ticket text. 
  If the attribute is present, return its value. 
  If it is not found, indicate TypeScript type "undefined". 
  \n\nAttributes:\n${attributesList}\n\nTicket Text:\n${ticket}\n\n
  For each attribute listed above, indicate its status based on the ticket text.`;

  console.log('Processing ticket for known variables:', ticket);

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt }
      // User and assistant roles are not needed here as the system prompt encapsulates the task completely
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.3, // Adjust based on desired creativity and adherence
    max_tokens: 512, // Adjust based on the complexity and length of the tickets
  });

  // Process the AI's response to extract attribute comparison results
  const aiResponse = chatCompletion.choices[0].message.content;
  console.log('AI response:', aiResponse);

  return attributes.reduce((acc, attr) => {
    // This regex looks for the attribute followed by any text until a newline or the response end
    const regex = new RegExp(`${attr}[:]?\\s*([^\\n]+)`, 'i');
    const match = aiResponse.match(regex);

    acc[attr] = match && match[1] ? match[1].trim() : "Attribute not found";
    return acc;
  }, {});
};


export const chatgptTicketVariables: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
  const systemPrompt = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it. Return these variables only as in JSON format.`;
  console.log ( 'chat gpt ticket variables', ticket )
  const chatCompletion = await openai.chat.completions.create ( {
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Ticket PA123
============
P4
Customer: a.customer@example.com

Issue:
 * I created a project (P-6666)
 * It is in the EPX acceptance by mistake.

Action requested:
* Please delete this.

Thanks`
      },
      {
        role: 'assistant',
        content: ` 
{"ticketId": "PA123",
"projectId": "P-6666",
"System: "EPX",
"Environment": "acceptance"}`
      },
      {
        role: 'user',
        content: `Ticket price44
==============
P4
Customer: a.customer@example.com

Issue:
* In the EPX the discombobulator (item code 1234-44) has an incorrect price.
* The price is currently 55.55.
* The price should be 44.44.

Please update the price of the discombobulator`
      },
      {
        role: 'assistant',
        content: `
{"ticketId": "price44",
"Customer": "a.customer@example.com",
"itemId": "1234-44",
"itemName": "discombobulator"}`
      },
      { role: 'user', content: ticket },
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0,
    response_format: { type: "json_object" }
  } );

  // Assuming chatCompletion.choices contains the formatted string with variables.
  const variablesString = chatCompletion.choices[ 0 ].message.content;
  console.log ( variablesString );

  return JSON.parse ( variablesString );
};


export const generalChat: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
  return {} as TicketVariables;
}

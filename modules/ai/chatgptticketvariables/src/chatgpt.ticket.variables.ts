import { AiTicketVariablesFn, TicketVariables } from "@itsmworkbench/ai_ticketvariables";
import { OpenAI } from "openai";

export const clientSecret = process.env[ 'CHATGPT_CLIENT_SECRET' ]

const openai = new OpenAI ( {
  apiKey: clientSecret,
} );

/**
 * Generates a verification email from the extracted ticket variables.
 *
 * @param {TicketVariables} variables - The extracted variables from an ITSM ticket.
 * @returns {Promise<TicketVariables>} - The generated email content.
 */
export const chatgptTicketVariables: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
  const systemPrompt = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it. Return these variables only as in JSON format.`;

  const chatCompletion = await openai.chat.completions.create ({
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
    response_format: {type: "json_object"}
  });

  // Assuming chatCompletion.choices contains the formatted string with variables.
  const variablesString = chatCompletion.choices[ 0 ].message.content;
  console.log(variablesString);

  return JSON.parse ( variablesString );
};

/**
 * Generates a verification email from the extracted ticket variables.
 *
 * @param {TicketVariables} variables - The extracted variables from an ITSM ticket.
 * @returns {Promise<string>} - The generated email content.
 */
export const generateVerificationEmail = async (variables: TicketVariables): Promise<string> => {
  const emailPrompt = `Given the following ticket variables: ${JSON.stringify(variables, null, 2)}
    Generate a professional email from an employee to their employer, using these variables to verify the actions taken on a ticket.`;

  const emailCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: emailPrompt },
      {
        role: 'user',
        content: 'Generate the email'
      }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.7, // A bit of creativity for more natural email text
  });

  // Assuming emailCompletion.choices contains the email content
  const emailContent = emailCompletion.choices[0].message.content;
  console.log(emailContent);

  return emailContent;
};

export const generalChat: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
  return {} as TicketVariables;
}

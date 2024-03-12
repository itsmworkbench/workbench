import { AiTicketVariablesFn, TicketVariables } from "@itsmworkbench/ai_ticketvariables";
import { OpenAI } from "openai";

export const clientSecret = process.env['CHATGPT_CLIENT_SECRET']

const openai = new OpenAI({
  apiKey: clientSecret,
});

// Assuming TicketVariables is structured to store the APIs response.
// The chatgptTicketVariables function is updated to simulate calling the ChatGPT API.
export const chatgptTicketVariables: AiTicketVariablesFn = async (ticket: string): Promise<TicketVariables> => {
  const systemPrompt = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it. Return these variables only as in key value format.`;

  const chatCompletion = await openai.chat.completions.create({
    messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: ticket },
    ],
    model: 'gpt-3.5-turbo',
  });

  // Assuming chatCompletion.choices contains the formatted string with variables.
  const variablesString = chatCompletion.choices[0].message.content;

  console.log(variablesString);

  return JSON.parse(variablesString);
};

//! have an integration test

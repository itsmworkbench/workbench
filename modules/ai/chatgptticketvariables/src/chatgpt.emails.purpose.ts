import { AIEmailsFn, EmailData, EmailPurpose } from "@itsmworkbench/ai_ticketvariables";
import { chatgptTicketVariables } from "./chatgpt.ticket.variables";

import { OpenAI } from "openai";

export const clientSecret = process.env[ 'CHATGPT_CLIENT_SECRET' ]

const openai = new OpenAI ( {
  apiKey: clientSecret,
} );

export const extractEmailDataFromTicket = async ( ticket: string ): Promise<EmailData> => {
  const allVariables = await chatgptTicketVariables ( ticket );
  return {
    purpose: allVariables.purposeOfEmail as EmailPurpose,
    ticketId: allVariables.ticketId,
    ticket: ticket
  };
}


export const generateAllPurposeEmail = async ( emailData: EmailData ): Promise<string> => {
  const extractedData = await extractEmailDataFromTicket ( emailData.ticket );

  const emailPrompt = `Given the following ticket ID: ${extractedData.ticketId}, purpose: ${extractedData.purpose} and details: ${JSON.stringify ( emailData.ticket, null, 2 )}
Generate a professional email from an employee to their employer, including a subject and body. 
Annotate the subject with <!-- SUBJECT START --> and <!-- SUBJECT END -->. Annotate the email body with <!-- EMAIL START --> and <!-- EMAIL END -->. 
Use these details to craft the email content.`;

  const emailCompletion = await openai.chat.completions.create ( {
    messages: [
      { role: 'system', content: emailPrompt },
      {
        role: 'user',
        content: 'Generate the email'
      }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.7, // A bit of creativity for more natural email text
  } );

  // Assuming emailCompletion.choices contains the email content
  const emailContent = emailCompletion.choices[ 0 ].message.content.trim ();
  console.log ( emailContent );

  return emailContent;
};

//TODO: unused method, we can delete later
export const determineEmailPurpose = async ( ticket: string ): Promise<EmailPurpose> => {
  const prompt = `Based on the following ticket details, should an email request for approval or closure be sent? Ticket details: "${ticket}"`;

  const response = await openai.chat.completions.create ( {
    messages: [
      { role: 'system', content: prompt },
      {
        role: 'user',
        content: 'Generate the email purpose'
      }
    ],
    model: "gpt-3.5-turbo", // or any suitable model
    max_tokens: 60,
    temperature: 0.5,
  } );

  const answer = response.choices[ 0 ].message.content.trim ().toLowerCase ();

  // Decide the purpose based on the model's response
  if ( answer.includes ( "approval" ) ) {
    return 'requestApproval';
  } else if ( answer.includes ( "closure" ) ) {
    return 'requestClosure';
  } else {
    // Default or handle ambiguity
    console.log ( "Ambiguous or unclear answer from AI, consider manual review." );
    return 'requestApproval'; // Defaulting or you might want a different handling
  }
};


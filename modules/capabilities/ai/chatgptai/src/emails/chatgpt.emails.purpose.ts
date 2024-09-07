import { EmailData, EmailPurpose, isEmailDataWithMissingData } from "@itsmworkbench/ai";

import { OpenAI } from "openai";
import { ChatCompletionCreateParams } from "openai/src/resources/chat/completions";
import { getResponse, OpenAiMessage } from "../variables/chatgpt.ticket.variables";

export const clientSecret = process.env[ 'CHATGPT_CLIENT_SECRET' ]

const openai = new OpenAI ( {
  apiKey: clientSecret,
} );

const generateEmailPrompt = ( emailData: EmailData ): string => {
  let purposeDescription: string;
  switch ( emailData.purpose ) {
    case 'requestApproval':
      purposeDescription = 'to request approval for a pending task or project';
      break;
    case 'requestClosure':
      purposeDescription = 'to inform about the completion of a task or project and request its closure';
      break;
    case 'requestMoreData':
      if ( !isEmailDataWithMissingData ( emailData ) ) throw new Error ( 'Email data is missing missingData field' );
      purposeDescription = 'to request additional information or data for completing a work ticket. The specific details needed are: ' + emailData.missingData.join ( ', ' );
      break;
    // Add more cases as needed for other purposes
    default:
      purposeDescription = 'for a general inquiry or update';
  }

  return `Given the following ticket ID: ${emailData.ticketId} and details: ${JSON.stringify ( emailData.ticket, null, 2 )}
Generate a professional email from an employee to their employer ${purposeDescription}. Include a subject and body in the email. 
Annotate the subject with <!-- SUBJECT START --> and <!-- SUBJECT END -->. Annotate the email body with <!-- EMAIL START --> and <!-- EMAIL END -->. 
Do not use salutations(Dear) and email signatures. No names in the end.
Use these details to craft the email content.`;
};


export const generateAllPurposeEmail = async ( emailData: EmailData ): Promise<string> => {
  const emailPrompt = generateEmailPrompt ( emailData );

  const messages: OpenAiMessage[] = [
    { role: 'system', content: emailPrompt },
    { role: 'user', content: 'Generate the email' }
  ];
  const emailContent = await getResponse ( messages );
console.log ( emailContent );

  return emailContent || 'Ai was unable to generate email';
};

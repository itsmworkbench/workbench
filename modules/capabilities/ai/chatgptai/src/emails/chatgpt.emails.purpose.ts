import { EmailData, EmailPurpose, isEmailDataWithMissingData } from "@itsmworkbench/ai";

import { OpenAI } from "openai";
import { ChatCompletionCreateParams, ChatCompletionCreateParamsBase } from "openai/src/resources/chat/completions";

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

  let body: ChatCompletionCreateParams = {
    messages: [
      { role: 'system', content: emailPrompt },
      { role: 'user', content: 'Generate the email' }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1024,
  };
  const emailCompletion = await openai.chat.completions.create ( body );

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
      { role: 'user', content: 'Generate the email purpose' }
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


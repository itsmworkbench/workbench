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
    case 'RequestMoreData':
      if ( !isEmailDataWithMissingData ( emailData ) ) throw new Error ( 'Email data is missing missingData field' );
      purposeDescription = 'to request additional information or data for completing a work ticket. The missing details are: ' + emailData.missingData.join ( ', ' );
      break;
    // Add more cases as needed for other purposes
    default:
      purposeDescription = 'for a general inquiry or update';
  }

  return `You are an AI email assistant. Your task is to generate a concise and professional email for the following situation.

  ---
### Ticket Details:
      - **Ticket ID:** ${emailData.ticketId}
  - **Ticket Description:** ${JSON.stringify(emailData.ticket, null, 2)}

### Purpose:
      The email should be written for the purpose of **${purposeDescription}**

  ---
### Instructions:
  1. **Write in a formal but concise manner**. Keep the email **brief and to the point**.
  2. **Do NOT include salutations** (e.g., "Dear Sir/Madam") or email signatures.
  3. **DO NOT fabricate any missing information**. If details are missing, clearly state that additional input is needed.
  4. **You can include something like: "I am a simple AI, I might make mistakes, that's why I need your help".
  5. **Format the response as follows**:

  ---
  **Output Format:**
\`\`\`
<!-- SUBJECT START -->
[Generated Email Subject]
<!-- SUBJECT END -->

<!-- EMAIL START -->
[Generated Email Body]
<!-- EMAIL END -->
\`\`\`

---
### Example (DO NOT COPY, JUST FOLLOW THE FORMAT):

\`\`\`
<!-- SUBJECT START -->
Request for Additional Information on Ticket 12345
<!-- SUBJECT END -->

<!-- EMAIL START -->
We are currently processing the request regarding [Issue Description]. However, we require the following additional details to proceed: [Missing Data List].

Please provide this information at your earliest convenience.
<!-- EMAIL END -->
\`\`\`

Now, generate the email following the above format.`;
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

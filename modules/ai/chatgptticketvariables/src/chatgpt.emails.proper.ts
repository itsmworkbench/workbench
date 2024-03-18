import { AIEmailsFn, EmailData, EmailPurposeAnd, EmailResult, EmailStringFn, processEmailsThatReturnAstring } from "@itsmworkbench/ai_ticketvariables";
import {
  generateAllPurposeEmail,
} from "./chatgpt.emails.purpose";

const requestClosure: EmailStringFn = async ( email: EmailData ): Promise<string> => {
  return generateAllPurposeEmail(email);
}
const requestApproval: EmailStringFn = async ( email ) => {
  return generateAllPurposeEmail(email);
}
export const chatGptEmailProcessors: EmailPurposeAnd<EmailStringFn> = {
  requestApproval,
  requestClosure
}

function extractEmailResultFromRagString(s: string): EmailResult{
  const subjectMatch = s.match ( /<!-- SUBJECT START -->(.*?)<!-- SUBJECT END -->/s );
  const subject = subjectMatch ? subjectMatch[ 1 ].trim () : "No Subject";
  console.log ( "Subject: ", subject );

  // Extract email body using regex
  const emailBodyMatch = s.match ( /<!-- EMAIL START -->(.*?)<!-- EMAIL END -->/s );
  const emailBody = emailBodyMatch ? emailBodyMatch[ 1 ].trim () : "No Email Content";
  console.log ( "Email Body: ", emailBody );

  return {
    subject: subject,
    email: emailBody,
  };
}

export const emailProcessor: AIEmailsFn = processEmailsThatReturnAstring ( chatGptEmailProcessors, extractEmailResultFromRagString )

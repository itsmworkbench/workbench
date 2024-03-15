import { AIEmailsFn, EmailData, EmailResult } from "@itsmworkbench/ai_ticketvariables";
import { chatgptTicketVariables } from "./chatgpt.ticket.variables";
import { generateAllPurposeEmail } from "./chatgpt.emails.purpose";

export const generalEmail: AIEmailsFn = async ( email: EmailData ): Promise<EmailResult> => {
  try {
    const annotatedEmailContent = await generateAllPurposeEmail ( email );

    // Extract subject using regex
    const subjectMatch = annotatedEmailContent.match ( /<!-- SUBJECT START -->(.*?)<!-- SUBJECT END -->/s );
    const subject = subjectMatch ? subjectMatch[ 1 ].trim () : "No Subject";
    console.log ( "Subject: ", subject );

    // Extract email body using regex
    const emailBodyMatch = annotatedEmailContent.match ( /<!-- EMAIL START -->(.*?)<!-- EMAIL END -->/s );
    const emailBody = emailBodyMatch ? emailBodyMatch[ 1 ].trim () : "No Email Content";
    console.log ( "Email Body: ", emailBody );

    return {
      subject: subject,
      email: emailBody,
    };
  } catch ( error ) {
    console.error ( "Error generating email: ", error );
    return {
      error: {
        name: "EmailGenerationError",
        message: typeof error === "string" ? error : error.message || "Unknown error",
      }
    }
  }
}

import { AIEmailsFn, EmailData, EmailResult } from "@itsmworkbench/ai_ticketvariables";
import {emailProcessor} from "./chatgpt.emails.proper";

export const generalEmail: AIEmailsFn = async ( email: EmailData ): Promise<EmailResult> => {
  try {
    const emailContent = await emailProcessor ( email );

    return {
      subject: emailContent.subject,
      email: emailContent.email,
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

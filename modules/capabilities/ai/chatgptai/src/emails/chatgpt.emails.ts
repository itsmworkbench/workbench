import { AIEmailsFn, EmailData, EmailResult } from "@itsmworkbench/ai";
import {emailProcessor} from "./chatgpt.emails.proper";

export const generalEmail: AIEmailsFn = async ( email: EmailData ): Promise<EmailResult> => {
  try {
    console.log('Got to general email')
    const emailContent = await emailProcessor ( email );
    console.log('Email content')

    return {
      subject: emailContent.subject,
      email: emailContent.email,
    };
  } catch ( error:any ) {
    console.error ( "Error generating email: ", error );
    return {
      error: {
        name: "EmailGenerationError",
        message: typeof error === "string" ? error : error.message || "Unknown error",
      }
    }
  }
}

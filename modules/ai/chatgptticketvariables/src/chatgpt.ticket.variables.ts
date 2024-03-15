import {
  AIEmailsFn,
  AiTicketVariablesFn,
  EmailData, EmailPurpose,
  EmailResult,
  TicketVariables
} from "@itsmworkbench/ai_ticketvariables";
import {OpenAI} from "openai";

export const clientSecret = process.env[ 'CHATGPT_CLIENT_SECRET' ]

const openai = new OpenAI ( {
  apiKey: clientSecret,
} );


export const chatgptTicketVariables: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
  const systemPrompt = `You will be provided with a ITSM work ticket, and your task is to extract important variables from it.
   Make sure the these 2 variables always exist: 
   * ticketId
   * purposeOfEmail
   Return these variables only as in JSON format.`;
  console.log('chat gpt ticket variables', ticket)
  const chatCompletion = await openai.chat.completions.create ( {
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
    response_format: { type: "json_object" }
  } );

  // Assuming chatCompletion.choices contains the formatted string with variables.
  const variablesString = chatCompletion.choices[ 0 ].message.content;
  console.log ( variablesString );

  return JSON.parse ( variablesString );
};

export const extractEmailDataFromTicket = async (ticket: string): Promise<EmailData> => {
  const allVariables = await chatgptTicketVariables ( ticket );
  return {
    purpose: allVariables.purposeOfEmail,
    ticketId: allVariables.ticketId,
    ticket: ticket
  };
}

//TODO: unused method, we can delete later
export const determineEmailPurpose = async (ticket: string): Promise<EmailPurpose> => {
  const prompt = `Based on the following ticket details, should an email request for approval or closure be sent? Ticket details: "${ticket}"`;

  const response = await openai.chat.completions.create({
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
  });

  const answer = response.choices[0].message.content.trim().toLowerCase();

  // Decide the purpose based on the model's response
  if (answer.includes("approval")) {
    return 'requestApproval';
  } else if (answer.includes("closure")) {
    return 'requestClosure';
  } else {
    // Default or handle ambiguity
    console.log("Ambiguous or unclear answer from AI, consider manual review.");
    return 'requestApproval'; // Defaulting or you might want a different handling
  }
};


export const generateAllPurposeEmail = async (emailData: EmailData): Promise<string> => {
  const extractedData = await extractEmailDataFromTicket(emailData.ticket);

  const emailPrompt = `Given the following ticket ID: ${extractedData.ticketId}, purpose: ${extractedData.purpose} and details: ${JSON.stringify(emailData.ticket, null, 2)}
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
  const emailContent = emailCompletion.choices[ 0 ].message.content.trim();
  console.log ( emailContent );

  return emailContent;
};

export const generalEmail: AIEmailsFn = async ( email: EmailData ): Promise<EmailResult> => {
  try {
    const annotatedEmailContent = await generateAllPurposeEmail(email);

    // Extract subject using regex
    const subjectMatch = annotatedEmailContent.match(/<!-- SUBJECT START -->(.*?)<!-- SUBJECT END -->/s);
    const subject = subjectMatch ? subjectMatch[1].trim() : "No Subject";
    console.log("Subject: ", subject);

    // Extract email body using regex
    const emailBodyMatch = annotatedEmailContent.match(/<!-- EMAIL START -->(.*?)<!-- EMAIL END -->/s);
    const emailBody = emailBodyMatch ? emailBodyMatch[1].trim() : "No Email Content";
    console.log("Email Body: ", emailBody);

    return {
      subject: subject,
      email: emailBody,
    };
  } catch ( error ) {
    console.error("Error generating email: ", error);
    return {
      error: {
        name: "EmailGenerationError",
        message: typeof error === "string" ? error : error.message || "Unknown error",
      }
    }
  }
}

export const generalChat: AiTicketVariablesFn = async ( ticket: string ): Promise<TicketVariables> => {
  return {} as TicketVariables;
}

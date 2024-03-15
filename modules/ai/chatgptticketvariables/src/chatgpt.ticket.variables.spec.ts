import { chatgptTicketVariables } from "./chatgpt.ticket.variables";
import { EmailData, EmailResult } from "@itsmworkbench/ai_ticketvariables";
import { generateAllPurposeEmail } from "./chatgpt.emails.purpose";
import { generalEmail } from "./chatgpt.emails";

jest.mock ( 'openai', () => ({
  OpenAI: jest.fn ().mockImplementation ( () => ({
    chat: {
      completions: {
        create: jest.fn ().mockImplementation ( ( { messages } ) => {
          const userMessage = messages.find ( message => message.role === 'user' ).content;

          if ( userMessage.includes ( 'Ticket' ) ) {
            return Promise.resolve ( {
              choices: [ {
                message: {
                  content: JSON.stringify ( {
                    customer: 'a.customer@example.com',
                    service: 'EPX',
                    projectId: 'p-66a6',
                    environment: 'production'
                  } )
                }
              } ]
            } );
          } else if ( userMessage.includes ( 'Generate the email' ) ) {
            return Promise.resolve ( {
              choices: [ { message: { content: 'Here is your professional email content based on the ticket.' } } ]
            } );
          }
          return Promise.reject ( new Error ( "Failed to fetch" ) );
        } )
      }
    }
  }) )
}) );


describe ( 'ChatGPTTicketVariables', () => {
  test ( 'should extract variables from ticket', async () => {
    const expectedOutput = { customer: 'a.customer@example.com', service: 'EPX', projectId: 'p-66a6', environment: 'production' }
    const sampleTicket = await chatgptTicketVariables ( 'Ticket PA123 P4 Customer: a.customer@example.com Issue: I created a project (p-66a6) It is in the epx production by mistake. Please remove this project from the EPX production.' );
    expect ( sampleTicket ).toEqual ( expectedOutput );
  } );
} );

describe ( 'generateVerificationEmail', () => {
  it ( 'should format the request correctly and return email content', async () => {
    // Setup
    const mockEmailData: EmailData = {
      purpose: "requestApproval", //changing for now
      ticketId: "ticketId",
      ticket: "sampleTicket"
    };
    const mockEmailContent = 'Here is your professional email content based on the ticket.';

    // Act
    const result = await generateAllPurposeEmail ( mockEmailData );

    // Assert
    expect ( result ).toBe ( mockEmailContent );
  } );

  it ( 'should format the request correctly and return EmailResult', async () => {
    // Setup
    const mockEmailData: EmailData = {
      purpose: "requestClosure", //changing for now
      ticketId: "ticketId",
      ticket: "sampleTicket"
    };

    const mockEmailResult: EmailResult = {
      email: "No Email Content",
      subject: "No Subject"
    };

    // Act
    const result = await generalEmail ( mockEmailData );

    // Assert
    expect ( result ).toStrictEqual ( mockEmailResult );
  } );
} );
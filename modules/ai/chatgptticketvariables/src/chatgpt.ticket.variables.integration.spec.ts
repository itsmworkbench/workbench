import { chatgptTicketVariables, } from "./chatgpt.ticket.variables";
import { EmailData } from "@itsmworkbench/ai_ticketvariables";
import { generateAllPurposeEmail } from "./chatgpt.emails.purpose";
import { generalEmail } from "./chatgpt.emails";

const sampleTicket = `Ticket SR5542
=============
Ticket colour
P4
Customer: bob.grey@thecompany.co.

Issue:
* in the DSS production environment the colour of the button is wrong. It should be blue and is red.
* The button is button id but-blue-123

Action requested:
* Please change the colour of the button

Thanks`;

describe ( 'ChatGPTTicketVariables', () => {
  test ( 'should extract variables from ticket', async () => {
    const sampleTicketVariables = await chatgptTicketVariables ( sampleTicket );
    expect ( typeof sampleTicketVariables ).toBe ( 'object' );
  } );

} );

describe ( 'ChatGPTEmailGeneration', () => {
  test ( 'should generate email from EmailData', async () => {
    const emailData: EmailData = {
      purpose: "requestApproval", //changing for now
      ticketId: "ticketId",
      ticket: sampleTicket
    };

    // Call the function with the variables to generate an email
    const emailContent = await generateAllPurposeEmail ( emailData );

    // Check if emailContent is a string (indicatively checking if an email was generated)
    expect ( typeof emailContent ).toBe ( 'string' );
    // Further tests can be added to check the content of the email if necessary
  } );

  test ( 'should generate general email with the EmailResult', async () => {
    const emailData: EmailData = {
      purpose: "requestApproval", //changing for now
      ticketId: "ticketId",
      ticket: sampleTicket
    };
    // Call the function with the variables to generate an email
    const generalEmailReturn = await generalEmail ( emailData );

    expect ( typeof generalEmailReturn ).toBe ( 'object' );
  } );
} );

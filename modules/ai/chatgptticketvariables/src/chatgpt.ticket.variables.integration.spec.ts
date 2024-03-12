import {chatgptTicketVariables, generateVerificationEmail} from "./chatgpt.ticket.variables";

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

describe('ChatGPTTicketVariables', () => {
  test('should extract variables from ticket', async () => {
    const sampleTicketVariables = await chatgptTicketVariables(sampleTicket);
    expect(typeof sampleTicketVariables).toBe('object');
  });

});

describe('ChatGPTEmailGeneration', () => {
  test('should generate email from sample variables', async () => {
    const variables = {
      ticketId: "SR5542",
      Customer: "bob.grey@thecompany.co",
      Environment: "DSS production",
      buttonId: "but-blue-123",
      desiredColor: "blue",
      currentColor: "red"
    };

    // Call the function with the variables to generate an email
    const emailContent = await generateVerificationEmail(variables);

    // Check if emailContent is a string (indicatively checking if an email was generated)
    expect(typeof emailContent).toBe('string');
    // Further tests can be added to check the content of the email if necessary
  });

  test('should generate email from incoming variables', async () => {
    const sampleTicketVariables = await chatgptTicketVariables(sampleTicket);

    // Call the function with the variables to generate an email
    const emailContent = await generateVerificationEmail(sampleTicketVariables);

    // Check if emailContent is a string (indicatively checking if an email was generated)
    expect(typeof emailContent).toBe('string');
    // Further tests can be added to check the content of the email if necessary
  });
});

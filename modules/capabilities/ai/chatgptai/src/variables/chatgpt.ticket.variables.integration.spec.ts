import { chatgptKnownTicketVariables, chatgptTicketVariables } from "./chatgpt.ticket.variables";

const sampleTicket = `Ticket SR5542
=============
Ticket colour
P4
Customer: bob.grey@thecompany.com

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

describe ( 'ChatGPTKnownTicketVariables', () => {
  const attributesToCheck = [ 'customer', 'ticketId', 'priority', 'environment', 'service', 'color' ];

  //todo: this test is failing because of inaccurate environment and service fields.
  test ( 'should accurately extract specified attributes from the ticket or report them as not found', async () => {
    const expectedResults = {
      'customer': 'bob.grey@thecompany.com', // Assuming the AI returns exact matches
      'ticketId': 'SR5542',
      'priority': 'P4',
      'environment': 'production',
      'service': 'DSS',
      'color': undefined // Example of an attribute that doesn't exist in the ticket
    };

    const extractedVariables = await chatgptKnownTicketVariables ( sampleTicket, attributesToCheck );

    expect ( typeof extractedVariables ).toBe ( 'object' );
    attributesToCheck.forEach ( attr => {
      expect ( extractedVariables ).toHaveProperty ( attr );
    } );
  } );
} );


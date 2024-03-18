import { chatgptTicketVariables, } from "./chatgpt.ticket.variables";

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

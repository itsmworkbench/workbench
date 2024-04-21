import {mistralTicketVariables} from "./mistral.ticket.variables";

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


describe ( 'MistralAITicketVariables', () => {
    test ( 'should extract variables from ticket', async () => {
        const sampleTicketVariables = await mistralTicketVariables ( sampleTicket );
        expect ( typeof sampleTicketVariables ).toBe ( 'object' );
    } );
} );

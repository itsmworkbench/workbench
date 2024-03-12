import { chatgptTicketVariables } from "./chatgpt.ticket.variables";


describe('ChatGPTTicketVariables', () => {
  test('should extract variables from ticket', async () => {
    const sampleTicket = await chatgptTicketVariables(`Ticket SR5542
=============
Ticket colour
P4
Customer: bob.grey@thecompany.co.

Issue:
* in the DSS production environment the colour of the button is wrong. It should be blue and is red.
* The button is button id but-blue-123

Action requested:
* Please change the colour of the button

Thanks
Select * from item where item_id= ‘but-blue-123’ - 1 row returned`);

  });

});
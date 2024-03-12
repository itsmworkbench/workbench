import { chatgptTicketVariables } from "./chatgpt.ticket.variables";


describe('ChatGPTTicketVariables', () => {
  test('should extract variables from ticket', async () => {
    const sampleTicket = await chatgptTicketVariables('Ticket PA123 P4 Customer: a.customer@example.com Issue: I created a project (p-66a6) It is in the epx production by mistake. Please remove this project from the EPX production.');

  });

});
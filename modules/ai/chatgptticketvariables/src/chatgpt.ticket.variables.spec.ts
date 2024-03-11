import { chatgptTicketVariables } from "./chatgpt.ticket.variables";

jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockImplementation(({ messages }) => {
          if (messages[0].content.includes('ticket')) {
            return Promise.resolve({
              choices: [{ message: { content: "customer: example@example.com, service: EPX, projectId: P-66a6, environment: production" }}]
            });
          }
          return Promise.reject(new Error("Failed to fetch"));
        })
      }
    }
  }))
}));

describe('ChatGPTTicketVariables', () => {
  test('should extract variables from ticket', async () => {
    const expectedOutput = {variables: "customer: example@example.com, service: EPX, projectId: P-66a6, environment: production"};
    const sampleTicket = await chatgptTicketVariables('Ticket PA123 P4 Customer: a.customer@example.com Issue: I created a project (p-66a6) It is in the epx production by mistake. Please remove this project from the EPX production.');
    expect(sampleTicket).toEqual(expectedOutput);
  });

});
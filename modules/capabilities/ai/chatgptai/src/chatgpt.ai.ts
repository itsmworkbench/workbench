import { chatgptKnownTicketVariables, chatgptTicketVariables } from "./variables/chatgpt.ticket.variables";
import { AI } from "@itsmworkbench/ai";
import { generalEmail } from "./emails/chatgpt.emails";

export function chatgptAi (): AI {
  return {
    variables: chatgptTicketVariables,
    knownVariables: chatgptKnownTicketVariables,
    emails: generalEmail,
  };
}
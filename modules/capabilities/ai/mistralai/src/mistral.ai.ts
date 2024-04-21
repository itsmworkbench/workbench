import { AI } from "@itsmworkbench/ai";
import { mistralTicketVariables } from "./variables/mistral.ticket.variables";

export function mistralAi (): AI {
  return {
    variables: mistralTicketVariables,
    knownVariables: undefined as any,
    emails: undefined as any
  };
}
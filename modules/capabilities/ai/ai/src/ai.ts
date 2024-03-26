import { AIKnownTicketVariablesFn, AiTicketVariablesFn } from "./ai.variables";
import { AIEmailsFn } from "./ai.email";

export interface AI {
  variables: AiTicketVariablesFn
  knownVariables: AIKnownTicketVariablesFn
  emails: AIEmailsFn
}

import { AIKnownTicketVariablesFn, AiTicketVariablesFn } from "./ai.variables";
import { AIEmailsFn, EmailDataWithMissingData } from "./ai.email";

export interface AI {
  variables: AiTicketVariablesFn
  knownVariables: AIKnownTicketVariablesFn
  emails: AIEmailsFn
}

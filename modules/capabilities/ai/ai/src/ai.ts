import { AIKnownTicketVariablesFn, AiTicketVariablesFn } from "./ai.variables";
import { AIEmailsFn, EmailDataWithMissingData } from "./ai.email";
import { NameAnd } from "@laoban/utils";

export interface AI {
  variables: AiTicketVariablesFn
  knownVariables: AIKnownTicketVariablesFn
  emails: AIEmailsFn
}

export type AiCapablities = NameAnd<AI>

export interface HasAiCapabilities {
  ais: AiCapablities
}
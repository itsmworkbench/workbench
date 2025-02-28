import {NameAnd} from "@itsmworkbench/utils";

export type PhaseName = 'CheckTicket' | 'Approval' | 'Resolve' | 'Close' | 'Review'
export const phaseNames: PhaseName[] = [ 'CheckTicket', 'Approval', 'Resolve', 'Close', 'Review' ]
export type PhaseNameAnd<T> = Record<PhaseName, T>

export type PhaseStatus = PhaseNameAnd<NameAnd<boolean>>


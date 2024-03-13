export type PhaseName = 'CheckTicket' | 'Approval' | 'Resolve' | 'Close' | 'Review'
export const phaseNames: PhaseName[] = [ 'CheckTicket', 'Approval', 'Resolve', 'Close', 'Review' ]
export type PhaseAnd<T> = Record<PhaseName, T>


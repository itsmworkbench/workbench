import { TicketType } from "@itsmworkbench/domain";

export const noTicketType: TicketType = {
  name: 'NoTicketType',
  description: 'General ticket type for tickets that do not have a specific type.',
  phase: {
    CheckTicket: {},
    Approval: {},
    Resolve: {},
    Close: {}
  }
}
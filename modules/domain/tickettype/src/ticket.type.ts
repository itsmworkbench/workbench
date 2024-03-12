import { Capability, PhaseAnd } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { NameAnd } from "@laoban/utils";

export interface TicketType {
  capabilities: Capability[]
  actions: PhaseAnd<NameAnd<Action>>
}
export const checkUsersTT: TicketType = ({
  capabilities: [ 'LDAP' ],
  actions: {
    CheckTicket: {
      checkUser: {
        safe: true,
        by: 'LDAP',
        who: 'issuer.email'
      },
      checkApprover: {
        safe: true,
        by: 'LDAP',
        who: 'approval.to'
      }
    },
    Approval: {},
    Resolve: {},
    Close: {}
  }
})
export const approvalTT: TicketType = {
  capabilities: [ 'Email', 'ReceiveEmail' ],
  actions: {
    CheckTicket: {},
    Approval: {
      requestApproval: {
        by: 'Email',
        to: 'approval.to',
        waitingFor: []
      },
      receiveApproval: {
        by: 'ReceiveEmail',
        from: 'approval.to',
        waitingFor: [ 'requestApproval' ]
      }
    },
    Resolve: {},
    Close: {}
  }
}
export const simpleTicketType: TicketType = ({
  capabilities: [ 'Email', 'ReceiveEmail' ],
  actions: {
    CheckTicket: {},
    Approval: {},
    Resolve: {},
    Close: {
      requestClosure: {
        by: 'Email',
        to: 'issuer.email',
        waitingFor: []
      },
      agreeClosure: {
        by: 'ReceiveEmail',
        from: 'issuer.email',
        waitingFor: [ 'requestClosure' ]
      },
      closed: {
        by: 'Ticket',
        waitingFor: [ 'agreeClosure' ]
      }
    }
  }
})

export const updateSqlTT: TicketType = ({
  capabilities: [ 'SQL' ],
  actions: {
    CheckTicket: {
      checkProblemExists: {
        by: 'SQL',
      },
    },
    Approval: {},
    Resolve: {
      checkIssueStillExists: {
        by: 'SQL',
      },
      resolve: {
        by: 'SQL',
        waitingFor: [ 'checkIssueStillExists' ]
      }
    },
    Close: {}
  }
})

export const installSoftwareTT: TicketType = ({
  capabilities: [ 'SSH' ],
  actions: {
    CheckTicket: {},
    Approval: {},
    Resolve: {
      installSoftware: {
        by: 'Manual',
      },
    },
    Close: {}
  }
})
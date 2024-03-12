import { Capability, PhaseAnd } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { NameAnd } from "@laoban/utils";

export interface TicketType {
  parents: TicketType[]
  name: string
  description: string
  capabilities: Capability[]
  actions: PhaseAnd<NameAnd<Action>>
}
const checkUsersTT: TicketType = ({
  parents: [],
  name: 'CheckUsers',
  description: 'We need to check if the user is valid in LDAP',
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
const simpleTicketType: TicketType = ({
  parents: [],
  name: 'Simple',
  description: 'A simple ticket type',
  capabilities: [],
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

const updateSql: TicketType = ({
  parents: [],
  name: 'UpdateSql',
  description: 'The ticket is about updating a SQL database',
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
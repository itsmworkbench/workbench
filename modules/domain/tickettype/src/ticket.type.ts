import { Capability, PhaseAnd } from "@itsmworkbench/domain";
import { Action } from "@itsmworkbench/actions";
import { NameAnd } from "@laoban/utils";
import { IdentityUrl, nameSpaceDetailsForGit } from "@itsmworkbench/urlstore";
import { Ticket } from "@itsmworkbench/tickets";
import { YamlCapability } from "@itsmworkbench/yaml";

export interface TicketType {
  name?: string
  id?: IdentityUrl
  variables?: string[]
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
    Close: {},
    Review: {}
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
    Close: {},
    Review: {}
  }
}
export const simpleTicketType: TicketType = ({
  capabilities: [ 'Email', 'ReceiveEmail' ],
  actions: {
    CheckTicket: {
      SelectKnowledgeArticle: {
        by: 'SelectKnowledgeArticle',
        recordInCapability: false,
      },
      ReviewTicket: {
        by: 'ReviewTicket',
      },
      RequestMoreData: {
        by: 'Email',
        to: 'issuer.email',
        optional: true,
        highlyVariant: true,
      }
    },
    Approval: {},
    Resolve: {
      resolveTheIssue: {
        by: 'Manual'
      }
    },
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
    },
    Review: {
      createKnowledgeArticle: {
        by: 'CreateKnowledgeArticle',
        recordInCapability: false,
        optional: true,
      }
    }
  }
})
export const usingTicketTypeTT: TicketType = {
  capabilities: [],
  actions: {
    CheckTicket: {},
    Approval: {},
    Resolve: {},
    Close: {},
    Review: {
      createKnowledgeArticle: {
        by: 'CreateKnowledgeArticle',
        recordInCapability: false,
      }
    }
  }
}
export const usingKATT: TicketType = {
  capabilities: [],
  actions: {
    CheckTicket: {},
    Approval: {},
    Resolve: {},
    Close: {},
    Review: {
      reviewKnowledgeArticle: {
        by: 'CreateKnowledgeArticle',
        recordInCapability: false,

      }
    }
  }

}

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
      resolveTheIssue: {
        by: 'SQL',
        waitingFor: [ 'checkIssueStillExists' ]
      }
    },
    Close: {},
    Review: {}
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
    Close: {},
    Review: {}
  }
})
export function ticketTypeNamespaceDetails ( yaml: YamlCapability, ) {
  return nameSpaceDetailsForGit ( 'ka', {
    extension: 'yaml',
    mimeType: 'text/markdown; charset=UTF-8',
    parser: ( id, s ) => yaml.parser ( s ),
    writer: yaml.writer,
  } );
}

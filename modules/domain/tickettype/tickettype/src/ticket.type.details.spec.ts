//a test that sets up a tickettypedetails and then checks detailsToTicketType
import { detailsToTicketType, TicketTypeDetails } from "./ticket.type.details";

describe ( 'detailsToTicketType', () => {
  it ( 'should return a simple ticket type', () => {
    const details: TicketTypeDetails = {
      ticketType: 'General',
      approvalState: 'Needs Approval',
      validateInvolvedParties: false,
    }
    const result = detailsToTicketType ( details )
    expect ( result ).toEqual ( {
      "actions": {
        "Approval": {
          "receiveApproval": {
            "by": "ReceiveEmail",
            "from": "approval.to",
            "waitingFor": [
              "requestApproval"
            ]
          },
          "requestApproval": {
            "by": "Email",
            "to": "approval.to",
            "waitingFor": []
          }
        },
        "CheckTicket": {
          "ReviewTicket": {
            "by": "ReviewTicket"
          }
        },
        "Close": {
          "agreeClosure": {
            "by": "ReceiveEmail",
            "from": "issuer.email",
            "waitingFor": [
              "requestClosure"
            ]
          },
          "closed": {
            "by": "Ticket",
            "waitingFor": [
              "agreeClosure"
            ]
          },
          "requestClosure": {
            "by": "Email",
            "to": "issuer.email",
            "waitingFor": []
          }
        },
        "Resolve": {},
        "Review": {
          "createKnowledgeArticle": {
            "by": "KnowledgeArticle"
          }
        }
      },
      "capabilities": [
        "Email",
        "KnowledgeArticle",
        "ReceiveEmail"
      ]
    } )
  } )
} )


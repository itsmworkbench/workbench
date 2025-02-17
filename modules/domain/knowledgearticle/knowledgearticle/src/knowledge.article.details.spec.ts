//a test that sets up a tickettypedetails and then checks detailsToTicketType
import { detailsToKnowledgeArticle, KnowledgeArticleDetails } from "./knowledgeArticleDetails";

describe ( 'detailsToKnowledgeArticle', () => {
  it ( 'should return a simple knowledge article', () => {
    const details: KnowledgeArticleDetails = {
      ticketType: 'General',
      approvalState: 'Needs Approval',
      validateInvolvedParties: false,
    }
    const result = detailsToKnowledgeArticle ( details )
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


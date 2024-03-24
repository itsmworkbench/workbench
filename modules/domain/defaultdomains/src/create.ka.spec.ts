import { Event } from "@itsmworkbench/events";
import { findActionInEventsFor, lastTicketType, makeKnowledgeArticle } from "./create.ka";

const raw = `
{"event":"setValue","path":"blackboard.ticketType","value":{"ticketTypeDetails":{"ticketType":"Update Database","approvalState":"Needs Approval","validateInvolvedParties":true},"ticketType":{"capabilities":["Email","KnowledgeArticle","LDAP","ReceiveEmail","SQL"],"actions":{"CheckTicket":{"checkProblemExists":{"by":"SQL"},"checkUser":{"safe":true,"by":"LDAP","who":"issuer.email"},"checkApprover":{"safe":true,"by":"LDAP","who":"approval.to"}},"Approval":{"requestApproval":{"by":"Email","to":"approval.to","waitingFor":[]},"receiveApproval":{"by":"ReceiveEmail","from":"approval.to","waitingFor":["requestApproval"]}},"Resolve":{"checkIssueStillExists":{"by":"SQL"},"resolveTheIssue":{"by":"SQL","waitingFor":["checkIssueStillExists"]}},"Close":{"requestClosure":{"by":"Email","to":"issuer.email","waitingFor":[]},"agreeClosure":{"by":"ReceiveEmail","from":"issuer.email","waitingFor":["requestClosure"]},"closed":{"by":"Ticket","waitingFor":["agreeClosure"]}},"Review":{"createKnowledgeArticle":{"by":"KnowledgeArticle"}}}}},"context":{"display":{"title":"Ticket Type","type":"ticketType","hide":true}}}
{"event":"setId","id":"itsmid/me/ticket/12990c9b0e6db3b0f69e5886285045b125ca9f4f","path":"ticket","context":{"display":{"title":"New Update Database Ticket","type":"ticket","name":"Price"},"ticketTypeDetails":{"ticketType":"Update Database","approvalState":"Needs Approval","validateInvolvedParties":true}}}
{"event":"setValue","path":"blackboard.ticket","value":{"Customer":"a.customer@example.com","itemId":"1234-44","itemName":"discombobulator","currentPrice":"55.55","correctedPrice":"44.44","Environment":"EPX production"},"context":{"display":{"title":"Ticket Variables","type":"variables","hide":true}}}
{"event":"setValue","value":true,"path":"blackboard.status.CheckTicket.checkUser","context":{"where":{"phase":"CheckTicket","action":"checkUser","tab":"LDAPWorkbench"},"capability":"LDAP","display":{"title":"Ldap check to Check User","type":"LDAP","successOrFail":true},"data":{"email":"a.customer@example.com","response":"groups: A,B"}}}
{"event":"setValue","value":true,"path":"blackboard.status.CheckTicket.checkApprover","context":{"where":{"phase":"CheckTicket","action":"checkApprover","tab":"LDAPWorkbench"},"capability":"LDAP","display":{"title":"Ldap check to Check Approver","type":"LDAP","successOrFail":true},"data":{"email":"the.boss@example.com","response":"groups: A,B,BOSS"}}}
{"event":"setValue","value":true,"path":"blackboard.status.Approval.requestApproval","context":{"capability":"Email","where":{"phase":"Approval","action":"requestApproval","tab":"EmailWorkbench"},"display":{"title":"Sending email [Approval Required for Price Correction in EPX System]","type":"Email","successOrFail":true},"data":{"to":"the.boss@example.com","subject":"Approval Required for Price Correction in EPX System","email":"I am writing to inform you of a discrepancy in the EPX system regarding the discombobulator (item code 1234-44). The current listed price is £55.55, which is incorrect. The correct price for this item should be £44.44.\\n\\nTo ensure our pricing reflects accurately in the EPX production environment and to maintain our integrity with our customers, I request your approval to update the price from £55.55 to £44.44.\\n\\nYour prompt attention to this matter will be greatly appreciated as it will help us to continue providing accurate and reliable service to our customers.\\n\\nThank you for your understanding and support."}}}
{"event":"setValue","value":true,"path":"blackboard.status.Approval.receiveApproval","context":{"where":{"phase":"Approval","action":"receiveApproval","tab":"ReceiveEmailWorkbench"},"display":{"title":"ReceiveEmail check to Receive Approval","type":"ReceiveEmail","successOrFail":true},"data":{"email":"Approved","from":"the.boss@example.com"}}}
{"event":"setValue","value":true,"path":"blackboard.status.CheckTicket.checkProblemExists","context":{"capability":"SQL","where":{"phase":"CheckTicket","action":"checkProblemExists","tab":"SQLWorkbench"},"data":{"sql":"select * from product where item_code='1234-44'"},"display":{"title":"Sql to Check Problem Exists","type":"SQL","successOrFail":true}}}
{"event":"setValue","value":true,"path":"blackboard.status.Resolve.checkIssueStillExists","context":{"capability":"SQL","where":{"phase":"Resolve","action":"checkIssueStillExists","tab":"SQLWorkbench"},"data":{"sql":"select * from product where item_code='1234-44'"},"display":{"title":"Sql to Check Issue Still Exists","type":"SQL","successOrFail":true}}}
{"event":"setValue","value":true,"path":"blackboard.status.Resolve.resolveTheIssue","context":{"capability":"SQL","where":{"phase":"Resolve","action":"resolveTheIssue","tab":"SQLWorkbench"},"data":{"sql":"delete from product where item_code='1234-44'"},"display":{"title":"Sql to Resolve The Issue","type":"SQL","successOrFail":true}}}
{"event":"setValue","value":true,"path":"blackboard.status.Close.requestClosure","context":{"capability":"Email","where":{"phase":"Close","action":"requestClosure","tab":"EmailWorkbench"},"display":{"title":"Sending email [ Confirmation of Price Update in EPX System - Request to Close Ticket]","type":"Email","successOrFail":true},"data":{"to":"a.customer@example.com","subject":" Confirmation of Price Update in EPX System - Request to Close Ticket","email":"I am pleased to inform you that the price discrepancy for the discombobulator (item code 1234-44) in the EPX system has been successfully corrected. The price has been updated from £55.55 to the accurate price of £44.44, as requested.\\n\\nWith this issue now resolved, I would like to seek your confirmation to proceed with closing the related ITSM ticket. Your approval to close this ticket will signify that the matter has been addressed to your satisfaction.\\n\\nPlease let me know at your earliest convenience if you agree to close the ticket or if there are any further actions required on this matter.\\n\\nLooking forward to your confirmation."}}}
{"event":"setValue","value":true,"path":"blackboard.status.Close.agreeClosure","context":{"where":{"phase":"Close","action":"agreeClosure","tab":"ReceiveEmailWorkbench"},"display":{"title":"ReceiveEmail check to Agree Closure","type":"ReceiveEmail","successOrFail":true},"data":{"email":"Thanks for you help. I checked it and it looks good\\n\\nSure go ahead","from":"a.customer@example.com"}}}
`
const events: Event[] = raw.split ( '\n' ).filter ( t => t.length > 0 ).map ( t => t.trim () ).map ( line => JSON.parse ( line ) )
describe ( 'createKnowledgeArticle', () => {
  it ( 'should create a knowledge article', () => {
    const tt = lastTicketType ( events )
    expect ( makeKnowledgeArticle ( events, tt, { "approval.to": "someName" } ) ).toEqual ( {
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
            "email": "I am writing to inform you of a discrepancy in the EPX system regarding the discombobulator (item code 1234-44). The current listed price is £55.55, which is incorrect. The correct price for this item should be £44.44.\n\nTo ensure our pricing reflects accurately in the EPX production environment and to maintain our integrity with our customers, I request your approval to update the price from £55.55 to £44.44.\n\nYour prompt attention to this matter will be greatly appreciated as it will help us to continue providing accurate and reliable service to our customers.\n\nThank you for your understanding and support.",
            "subject": "Approval Required for Price Correction in EPX System",
            "to": "the.boss@example.com"
          }
        },
        "CheckTicket": {
          "checkApprover": {
            "by": "LDAP",
            "who": "the.boss@example.com"
          },
          "checkProblemExists": {
            "by": "SQL",
            "sql": "select * from product where item_code='1234-44'"
          },
          "checkUser": {
            "by": "LDAP",
            "who": "a.customer@example.com"
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
            "email": "I am pleased to inform you that the price discrepancy for the discombobulator (item code 1234-44) in the EPX system has been successfully corrected. The price has been updated from £55.55 to the accurate price of £44.44, as requested.\n\nWith this issue now resolved, I would like to seek your confirmation to proceed with closing the related ITSM ticket. Your approval to close this ticket will signify that the matter has been addressed to your satisfaction.\n\nPlease let me know at your earliest convenience if you agree to close the ticket or if there are any further actions required on this matter.\n\nLooking forward to your confirmation.",
            "subject": " Confirmation of Price Update in EPX System - Request to Close Ticket",
            "to": "a.customer@example.com"
          }
        },
        "Resolve": {
          "checkIssueStillExists": {
            "by": "SQL",
            "sql": "select * from product where item_code='1234-44'"
          },
          "resolveTheIssue": {
            "by": "SQL",
            "sql": "delete from product where item_code='1234-44'"
          }
        },
        "Review": {
          "createKnowledgeArticle": {
            "by": "KnowledgeArticle"
          }
        }
      },
      "capabilities": [
        "Email",
        "LDAP",
        "SQL"
      ],
      "variables": []
    } )
  } )
} )

describe ( "findActionInEventsFor", () => {
  it ( "should find the action in the events", () => {
    expect ( findActionInEventsFor ( events, 'Resolve', 'resolveTheIssue' ) ).toEqual ( {
      by: 'SQL',
      sql: 'delete from product where item_code=\'1234-44\'',
      waitingFor: [ 'checkIssueStillExists' ]
    } )
  } )
} )

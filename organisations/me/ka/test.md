capabilities:
  - Email
  - LDAP
  - SQL
actions:
  CheckTicket:
    checkProblemExists:
      by: SQL
      sql: select * from product where item_code='${itemId}'
    checkUser:
      by: LDAP
      who: ${Customer}
    checkApprover:
      by: LDAP
      who: the.boss@example.com
  Approval:
    requestApproval:
      by: Email
      to: the.boss@example.com
      subject: Approval Required for Price Correction in EPX System
      email: >-
        I am writing to inform you of a discrepancy in the EPX system regarding
        the ${itemName} (item code ${itemId}). The current listed price is
        £${currentPrice}, which is incorrect. The correct price for this item
        should be £${correctedPrice}.


        To ensure our pricing reflects accurately in the ${Environment}
        environment and to maintain our integrity with our customers, I request
        your approval to update the price from £${currentPrice} to
        £${correctedPrice}.


        Your prompt attention to this matter will be greatly appreciated as it
        will help us to continue providing accurate and reliable service to our
        customers.


        Thank you for your understanding and support.
    receiveApproval:
      by: ReceiveEmail
      from: approval.to
      waitingFor:
        - requestApproval
  Resolve:
    checkIssueStillExists:
      by: SQL
      sql: select * from product where item_code='${itemId}'
    resolveTheIssue:
      by: SQL
      sql: delete from product where item_code='${itemId}'
  Close:
    requestClosure:
      by: Email
      to: ${Customer}
      subject: ' Confirmation of Price Update in EPX System - Request to Close Ticket'
      email: >-
        I am pleased to inform you that the price discrepancy for the
        ${itemName} (item code ${itemId}) in the EPX system has been
        successfully corrected. The price has been updated from £${currentPrice}
        to the accurate price of £${correctedPrice}, as requested.


        With this issue now resolved, I would like to seek your confirmation to
        proceed with closing the related ITSM ticket. Your approval to close
        this ticket will signify that the matter has been addressed to your
        satisfaction.


        Please let me know at your earliest convenience if you agree to close
        the ticket or if there are any further actions required on this matter.


        Looking forward to your confirmation.
    agreeClosure:
      by: ReceiveEmail
      from: issuer.email
      waitingFor:
        - requestClosure
    closed:
      by: Ticket
      waitingFor:
        - agreeClosure
  Review:
    createKnowledgeArticle:
      by: KnowledgeArticle

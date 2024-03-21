variables:
  - Environment
  - currentColor
  - desiredColor
  - itemId
  - itemName
capabilities:
  - Email
  - ReceiveEmail
  - SQL
actions:
  CheckTicket:
    checkProblemExists:
      by: SQL
      sql: select * from products where item_id='${itemId}'
  Approval:
    requestApproval:
      by: Email
      to: approval.to
      subject: >-
        Approval Request for Color Correction on Button in EPX Production
        Environment
      email: >-
        I would like to bring to your attention an issue concerning the visual
        presentation in the EPX ${Environment} environment. Specifically, the
        color of the ${itemName} with the ID ${itemId} is currently set to
        ${currentColor}, which does not align with our intended design
        specifications. The correct color for this ${itemName} should be
        ${desiredColor}, as it is crucial for maintaining the consistency and
        usability of our interface.


        To rectify this discrepancy and enhance the user experience, I request
        your approval to proceed with the necessary changes to update the color
        of the aforementioned ${itemName} to ${desiredColor}.


        Your prompt approval will enable us to make the adjustments swiftly and
        ensure that our platform remains intuitive and visually cohesive for all
        users.


        Thank you for your attention to this matter and your ongoing support.
    receiveApproval:
      by: ReceiveEmail
      from: approval.to
      waitingFor:
        - requestApproval
      email: Go for it
  Resolve:
    checkIssueStillExists:
      by: SQL
      sql: select * from products where item_id='${itemId}'
    resolveTheIssue:
      by: SQL
      sql: update products set colour='${desiredColor}' where item_id='${itemId}'
  Close:
    requestClosure:
      by: Email
      to: issuer.email
      subject: ' Confirmation of Button Color Update in EPX System - Request to Close Ticket'
      email: >-
        I am happy to report that the color of the ${itemName} with ID ${itemId}
        in the EPX ${Environment} environment has been successfully updated to
        ${desiredColor}, as per the requested action. This change ensures our
        platform's visual consistency and enhances the overall user experience.


        With this issue now addressed, I would like to request your confirmation
        to proceed with closing the related ITSM ticket. Your approval to close
        this ticket will indicate that the resolution meets your expectations
        and that no further action is requi${currentColor} on this matter.


        Please let me know if you agree with closing the ticket or if there are
        any additional concerns that need to be addressed.


        Looking forward to your prompt response.
    agreeClosure:
      by: ReceiveEmail
      from: issuer.email
      waitingFor:
        - requestClosure
      email: Looks good. Blue now
    closed:
      by: Ticket
      waitingFor:
        - agreeClosure
  Review:
    createKnowledgeArticle:
      by: KnowledgeArticle

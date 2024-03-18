variables: []
capabilities:
  - Email
  - LDAP
  - ReceiveEmail
  - SQL
actions:
  CheckTicket:
    ReviewTicket:
      by: ReviewTicket
    SelectKnowledgeArticle:
      by: SelectKnowledgeArticle
      recordInCapability: false
    RequestMoreData:
      by: Email
      to: issuer.email
      optional: true
      highlyVariant: true
    checkProblemExists:
      by: SQL
      sql: select * from products where item_code = '1234-44'
    checkUser:
      safe: true
      by: LDAP
      who: a.customer@example.com
    checkApprover:
      safe: true
      by: LDAP
      who: the.boss@example.com
  Approval:
    requestApproval:
      waitingFor: []
      by: Email
      to: the.boss@example.com
      subject: Please approve price change of discombobulator from 44.44=>55.55
      email: |-
        Ah, in the bonnie realm of EPX's ground,
        A wee mistake in pricing has been found.
        The discombobulator, item so rare,
        Is marked at fifty-five, fair and square.

        But hark, this price doth not ring true,
        For forty-four and forty-four cents is due.
        This noble item, code one-two-three-four-four,
        Demands correction, lest our customers deplore.

        In the production's vast and digital glen,
        We seek thy nod to make it right again.
        With haste, approve, so we may swiftly mend,
        The price to its rightful figure we intend.

        So lend us, please, thy keen and guiding light,
        Reply with yes, and set this matter right.
        Any questions, or if debate ye may,
        Do not tarry, but contact me straight away.

        For customer's trust and satisfaction's sake,
        Let's amend this error, no time to forsake.
        With gratitude, for thy swift action we'll yearn,
        Till corrected, for this approval we burn.+
    receiveApproval:
      by: ReceiveEmail
      from: the.boss@example.com
      waitingFor:
        - requestApproval
      email: Sure
  Resolve:
    resolveTheIssue:
      waitingFor:
        - checkIssueStillExists
      by: SQL
      sql: update products set price= 55.55 where item_code = '1234-44'
    checkIssueStillExists:
      by: SQL
  Close:
    requestClosure:
      waitingFor: []
      by: Email
      to: a.customer@example.com
      subject: Can we close the ticket?
      email: |-
        Ah, my dear friend, in the realms of service and digital care,
        A ticket, like a leaf in the wind, has fluttered here and there.
        Now, as the bonnie sun sets on this issue's day,
        I seek thy counsel, in the kindest, most heartfelt way.

        This task, a journey through code and query we've endured,
        Together, through trials and tests, a resolution assured.
        Now stands the moment, in the calm after the storm,
        To ask, with respect and hope, for a form so warm.

        Can we close this ticket, its journey at an end?
        Seal it with your approval, on this, can we depend?
        For in your hands lies the power, so grand,
        To conclude this tale, with a gentle, guiding hand.

        In the spirit of camaraderie and mutual respect so true,
        I await your word, to close this chapter anew.
        Let us, with a nod, bring this to a close,
        And in doing so, our partnership further grows.

        With anticipation for your reply, and a heart so light,
        I bid thee consider, and bring this to a right.
        For together, we've journeyed, through thick and thin,
        And now, at the threshold, let conclusion begin.
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
      by: CreateKnowledgeArticle
      recordInCapability: false
      optional: true

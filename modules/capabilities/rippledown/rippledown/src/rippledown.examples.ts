import {NameAnd} from "@itsmworkbench/utils";
import {ObjectDefn} from "@itsmworkbench/object_defn";
import {lensBuilder} from "@itsmworkbench/optics";
import {ItsmState, TicketProgress} from "@itsmworkbench/itsm_state";


const lb = lensBuilder<ItsmState>()
const progressL = lb.focusOn('progress')

function missingAttributesProjection(a: NameAnd<string>) {
    return Object.values(a).some(v => v === undefined || v === null)
}

export const ticketProgressObjectDefn: ObjectDefn<ItsmState> = {
    fields: {
        hasAttributes: {
            fieldType: 'status',showLabel:'lastPathPart', lens: lb.focusOn('ticket').focusOn('attributes').projectToGetter('hasAttributes', attributes =>
                Object.keys(attributes).length > 0), editable: false
        },
        missingAttributes: {
            fieldType: 'status',showLabel:'lastPathPart', lens: lb.focusOn('ticket').focusOn('attributes').projectToGetter('missingAttributes',
                missingAttributesProjection), editable: false
        },
        approved: {fieldType: 'status', lens: progressL.focusOn('approved')},
        issueDemonstrated: {fieldType: 'status', lens: progressL.focusOn('issueDemonstrated')},
        issueResolved: {fieldType: 'status', lens: progressL.focusOn('issueResolved')},
        issueClosed: {fieldType: 'status', lens: progressL.focusOn('issueClosed')},
    },
    layout: [1, 2, 2, 2]
}
export const workflow = `The general workflow for a ticket is:
1. RequestMissingAttributes if there are any missing attributes. 
2. DemonstrateIssue if the issue has not been demonstrated.
    Please note that if more than 10 minutes has gone by since the last demonstration, you should probably demonstrate the issue again.
3. RequestApproval if the ticket needs approval.
4. ResolveIssue 
5. DemonstrateIssue to check that the issue has been resolved.
6. CloseIssue
7. Finished`

export const nextActionPrompt = (ticket: TicketProgress): string => `
You are a categorizer. You need to work out what action to do next with this ticket.

${workflow}

Look at this state and decide the task. Just give one work which is the name of the action. For example RequestMissingAttributes or DemonstrateIssue.
If you don't know what to do, you can say 'unknown'. Do not wrap the name in quotes, just return the name
${JSON.stringify(ticket, null, 2)}`


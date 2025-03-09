import {ErrorsOr} from "@itsmworkbench/errors";

type SqlResult = {
    cols: string[],
    rows: string[][]
}
type SqlSelectEventForTest = {
    tool: 'sqlSelect'
    params: string,
    attributeNames: string[]
    outcome: ErrorsOr<SqlResult>
}
type SqlUpdateEventForTest = {
    tool: 'sqlUpdate'
    params: string,
    attributeNames: string[]
    outcome: ErrorsOr<number>
}
type EmailEventForTest = {
    tool: 'email'
    params: string,
    attributeNames: string[]
}

type EventForTest = SqlSelectEventForTest | SqlUpdateEventForTest | EmailEventForTest

export const sqlEvent1: SqlSelectEventForTest = {
    tool: 'sqlSelect',
    params: 'select * from items where itemId=${itemId}',
    attributeNames: ['itemId'],
    outcome: {
        value: {
            cols: ['itemId', 'itemName', 'itemPrice'],
            rows: [['1', 'item1', '44.55']]
        }
    }
}
export const sqlEvent2: SqlUpdateEventForTest = {
    tool: 'sqlUpdate',
    params: 'updateitems set itemPrice=${correctedPrice} where itemId=${itemId}',
    attributeNames: ['itemId', 'correctedPrice'],
    outcome: {value: 1}
}

export const emailEvent: EmailEventForTest = {
    tool: 'email',
    params: 'Dear ${customerName},\n\nI need you to approve this ticket ${ticketId}',
    attributeNames: ['customerName', 'ticketId']
}
import React from "react";
import {LensProps, LensProps2, LensState} from "@focuson/state";
import {Box, Button, Container, Typography} from "@mui/material";
import TestIcon from '@mui/icons-material/SettingsEthernet'; // Example icon for "Test Connection"
import {FocusedTextArea, FocusedTextInput, IProcessEventSideEffect, IProcessEventSideEffectFn, SuccessFailContextFn, SuccessFailureButton, useAI, useAiKnownVariables, useAllVariables, useCurrentSelection, useMailer, useTicketTypeVariables, useVariables} from "@itsmworkbench/components";
import RefreshIcon from "@mui/icons-material/Refresh";
import {EmailTempData, EmailWorkBenchContext} from "@itsmworkbench/domain";
import {Action} from "@itsmworkbench/actions";
import {Ticket} from "@itsmworkbench/tickets";
import {AI, EmailDataWithMissingData} from "@itsmworkbench/ai";
import {EventSideEffect} from "@itsmworkbench/react_core";
import {lensBuilder} from "@itsmworkbench/optics";
import {safeArray} from "@laoban/utils";


export interface SuggestEmailForTicketButtonProps<S> extends LensProps2<S, Ticket, Action, any> {
}

export function SuggestEmailForTicketButton<S>({state}: SuggestEmailForTicketButtonProps<S>) {
    const ai: AI = useAI()
    const purpose = useCurrentSelection()?.action as any
    const ticket: Ticket | undefined = state.optJson1()
    const variables = useAllVariables(ticket)
    const ticketTypeVariables = useTicketTypeVariables()
    const missingData = ticketTypeVariables.filter(v => !variables[v])
    const actionState: LensState<S, any, any> = state.state2();
    const action = state.optJson2()
    console.log('SuggestEmailForTicketButton - action', action)

    function onClick() {
        if (ticket === undefined) return

        function callAi() {
            let emailParam = {
                purpose,
                ticketId: ticket?.id || '',
                ticket: ticket?.description || ''
            };
            const withMissingData = (action as any)?.withMissingData
            if (!withMissingData) return ai.emails(emailParam);
            let paramsWithMissing: EmailDataWithMissingData = {...emailParam, missingData};
            return ai.emails(paramsWithMissing)
        }

        callAi().then(res => {
            console.log('SuggestEmailForTicketButton - stat', state.state2())
            console.log('SuggestEmailForTicketButton - result', res)
            actionState.doubleUp().focus1On('subject').focus2On('email').setJson(
                res.subject || '',
                res.email || JSON.stringify(res.error, null, 2), '')
            // state.state3 ().focusOn ( 'description' ).setJson ( res.email || JSON.stringify ( res.error, null, 2 ), '' )
        })
    }

    if (ticket === undefined) return <span>Software error: cannot find the ticket</span>
    return <Button variant="contained" color="primary" endIcon={<TestIcon/>} onClick={onClick}>Suggest Email </Button>
}


export interface DisplayEmailWorkbenchProps<S> extends LensProps<S, Action, any> {
    SuggestButton: React.ReactNode
    processSe: IProcessEventSideEffectFn
}


function SendEmailButton<S>({state}: LensProps<S, EmailTempData, any>) {
    const mailer = useMailer()

    function sendOnClick() {
        const email = state.optJson()
        if (email)
            mailer.sendEmail({
                to: email.to,
                subject: email.subject,
                text: email.email
            }).then(response => {
                state.focusOn('response').setJson(JSON.stringify(response, null, 2), '')
            })
    }

    return <Button variant="contained" color="primary" onClick={sendOnClick} endIcon={<TestIcon/>}>Send Email </Button>;
}

export function TestMailerConnectionButton<S>({state}: LensProps<S, any, any>) {
    const mailer = useMailer()

    function testConnection() {
        mailer.test().then(response => {
            state.focusOn('response').setJson(JSON.stringify(response, null, 2), '')
        })
    }

    return <Button variant="contained" color="primary" onClick={testConnection} endIcon={<TestIcon/>}> Test Connection </Button>

}

//forTicket": {
//     "tempData": {
//       "ticketType": {
//         "ticketTypeDetails": {
//           "name": "",
//           "description": "",
//           "ticketType": "General",
//           "approvalState": "Needs Approval",
//           "validateInvolvedParties": false
//         },
//         "ticketType": {
//           "variables": [
//             "correctedPrice",
//             "currentPrice",
//             "environment",
//             "issuer",
//             "itemId",
//             "itemName",
//             "ticketName"
//           ],

export const variablesL = lensBuilder<any>().focusOn('forTicket').focusOn('tempData').focusOn('ticketType').focusOn('ticketType').focusOn('variables')

export function DisplayEmailWorkbench<S>({state, SuggestButton, processSe}: DisplayEmailWorkbenchProps<S>) {
    const action: any = state.optJson()
    const to = action.to || ''
    const subject = action.subject || ''
    const email = action.email || ''
    const response = action.response
    const variables = useVariables()
    console.log('variables are', variables)
    console.log('big state is', state.main)
    console.log('at lens end', variablesL.path, variablesL.get(state.main))
    const missingVariables = safeArray(variablesL.get(state.main)).filter((v: string) => !variables[v])
    for (const v of ['issuer', 'ticketName'])
        //remove v from missingVariables if it is there
        missingVariables.splice(missingVariables.indexOf(v), 1)
    console.log('missing variables', missingVariables)
    const contextFn: SuccessFailContextFn = (tab, phase, action, successOrFail): EmailWorkBenchContext => ({
        capability: 'Email',
        where: {phase, action, tab},
        display: {
            title: `Sending email [${subject}]`,
            type: 'Email',
            successOrFail
        },
        data: {to, subject, email, response}
    })

    const actionState: LensState<S, any, any> = state;
    return <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>Email</Typography>

        <Box marginBottom={2}>
            <Typography variant="subtitle1" gutterBottom>Send Email To</Typography>
            <FocusedTextInput fullWidth variant="outlined" state={actionState.focusOn('to')}/>
            <Typography variant="subtitle1" gutterBottom>Subject</Typography>
            <FocusedTextInput fullWidth variant="outlined" state={actionState.focusOn('subject')}/>
            <Typography variant="subtitle1" gutterBottom>Email</Typography>
            {SuggestButton}
            <FocusedTextArea fullWidth variant="outlined" multiline rows={12} state={actionState.focusOn('email')}/>
            <Box display="flex" flexDirection="row" flexWrap="wrap" gap={1}>
                <SendEmailButton state={actionState}/>
                <TestMailerConnectionButton state={actionState}/>
                <Button variant="contained" color="primary" endIcon={<RefreshIcon/>}> Reset</Button>
            </Box>
            {action.response && <pre>{action.response}</pre>}
            <SuccessFailureButton processSe={processSe(state)} title='Click when have sent the email' successOrFail={true} context={contextFn}/>
        </Box>

    </Container>
}



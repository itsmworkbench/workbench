import {GetterSetter} from "@itsmworkbench/react_utils";
import React from "react";
import {ticketProgressObjectDefn} from "@itsmworkbench/rippledown";
import {EditObjectFromDefn} from "@itsmworkbench/editobject";
import {ItsmState, itsmStateLB} from "@itsmworkbench/itsm_state";
import {PhaseTc} from "@itsmworkbench/phase_progress/src/phase.progress";
import {simplePhaseDisplays} from "@itsmworkbench/phase_progress/src/simplePhaseDisplay";
import {NameAnd} from "@itsmworkbench/utils";
import {LensAndPath} from "@itsmworkbench/optics";
import {PhaseStatus} from "@itsmworkbench/domain";


export type DisplayTicketProgressProps = {
    ops: GetterSetter<ItsmState>
}

export const ProgressPhaseNames: string[] = ['ticketOk', 'approval', 'issueDemonstrated', 'issueResolved', 'issueClosed']

export const ProgressPhaseLens: NameAnd<LensAndPath<ItsmState, PhaseStatus>> = {
    ticketOk: itsmStateLB.focusCompose({
        ticketDefined: itsmStateLB.focusOn('ticket').focusOn('attributes'),
        attributeKnown: itsmStateLB.focusOn('ticket')
    }),
    approved: itsmStateLB.focusOn('progress').focusOn('approved')
    ,
    issueDemonstrated: {lens: 'progress', path: 'issueDemonstrated'},
    issueResolved: {lens: 'progress', path: 'issueResolved'},
    issueClosed: {lens: 'progress', path: 'issueClosed'},
}
export const ticketProgressPhaseTc: PhaseTc<ItsmState> = {
    ...simplePhaseDisplays(),
    phases: () => ProgressPhaseNames,
    

}

export function DisplayTicketProcess({ops}: DisplayTicketProgressProps) {
    return <EditObjectFromDefn rootId='display-ticket' mainOps={ops} title='ticket.progress' objectDefn={ticketProgressObjectDefn} showLabel='raw'/>
}

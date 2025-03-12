import {GetterSetter} from "@itsmworkbench/react_utils";
import React from "react";
import {ticketProgressObjectDefn} from "@itsmworkbench/rippledown";
import {EditObjectFromDefn} from "@itsmworkbench/editobject";
import {ItsmState} from "@itsmworkbench/itsm_state";


export type DisplayTicketProgressProps = {
    ops: GetterSetter<ItsmState>
}

export function DisplayTicketProcess({ops}: DisplayTicketProgressProps) {
    return <EditObjectFromDefn rootId='display-ticket' mainOps={ops} title='ticket.progress' objectDefn={ticketProgressObjectDefn} showLabel='raw'/>
}

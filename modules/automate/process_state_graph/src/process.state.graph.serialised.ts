//This is the serialised form of the Psg

import {PsgGraph, PsgNodeId} from "./process.state.graph";


export type SerialisedPsgFn = (g: PsgGraph) => PsgGraphSerialised
export type DeserialisedPsgFn = (g: PsgGraphSerialised) => PsgGraph

export type IdToNodeSerialised = Map<PsgNodeId, PsgNodeSerialised>
export type PsgGraphSerialised = {
    idToNode: IdToNodeSerialised
}

export type PsgNodeSerialised = {
    name: string //the long name for this node. Typically a stream of tool names. This is just for debugging
    toolName: string // the name of the tool that occurs in this node
    defaultParams: any //If we had higher order or local types we'd use these. These are (for example) the default sql or the default email that will be sent by the tool
    events: EventStreamInNode[]
}

export type EventStreamInNode = {
    eventStreamName: string
    params?: any //only if they were different to the default params.
    outcome?: any//the result of the tool
    comment?: string//human comment that the operator made
    next: PsgNodeId
}

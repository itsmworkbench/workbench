//This is the serialised form of the Psg

export type PsgNodeId = number
export type IdToNode =PsgNode[]//This is a Map<PsgNodeId, PsgNode>
export type PsgGraph = {
    idToNode: IdToNode
    nameToId: Map<string, PsgNodeId>
}

export type PsgNode = {
    name: string //the long name for this node. Typically a stream of tool names. This is just for debugging
    toolName: string // the name of the tool that occurs in this node
    defaultParams: any //If we had higher order or local types we'd use these. These are (for example) the default sql or the default email that will be sent by the tool
    defaultAttributeNames: string[]
    events: EventSummary[]
}

export type EventSummary = {
    eventStreamName: string //for debugging
    attributeNames?: string[]
    params?: any //only if they were different to the default params.
    outcome?: any//the result of the tool
    comment?: string//human comment that the operator made
    next?: PsgNodeId
}

export type EventToPsgTC<Event> = {
    toolName: (e: Event) => string
    params: (e: Event) => any
    outcome: (e: Event) => any
    comment: (e: Event) => string
}

export type CreatePsgNodeTcFn<Event> = (tc: EventToPsgTC<Event>) => CreatePsgNodeFn<Event>
export type CreatePsgNodeFn<Event> = (es: Event[]) => PsgGraph



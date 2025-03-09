import {CreatePsgNodeFn, EventSummary, EventToPsgTC, PsgGraph, PsgNode} from "./process.state.graph";

export function calcPsgNode<Event>(tc: EventToPsgTC<Event>, idSoFar: string, event: Event): PsgNode {
    const toolName = tc.toolName(event)
    const defaultParams = tc.params(event)
    const events: EventSummary[] = []
    const name = `${idSoFar}.${toolName}`
    return {name: idSoFar, toolName, defaultParams, events}
}

export function calcPsgEvent<Event>(tc: EventToPsgTC<Event>, node: PsgNode, event: Event): EventSummary {
    const eventStreamName = node.name
    const params = JSON.stringify(node.defaultParams) === JSON.stringify(tc.params(event)) ? undefined : tc.params(event)
    const outcome = tc.outcome(event)
    const comment = tc.comment(event)
    return {eventStreamName, params, outcome, comment}
}


export function simpleCreatePsgNode<Event>(tc: EventToPsgTC<Event>): CreatePsgNodeFn<Event> {
    return (events: Event[]) => {
        const result: PsgGraph = {
            idToNode: [],
            nameToId: new Map()
        }
        let idSoFar = ''
        let lastEvent: EventSummary | undefined = undefined
        events.forEach((event, index) => {
            const candidate = calcPsgNode(tc, idSoFar, event)
            const id = result.nameToId.get(candidate.name)
            const thisId = id === undefined ? result.idToNode.length : id
            if (id === undefined) result.idToNode.push(candidate)
            const node = id == undefined ? candidate : result.idToNode[id]
            const es = calcPsgEvent(tc, node, event)
            if (lastEvent) lastEvent.next = thisId
            lastEvent = es
            node.events.push(es)
        })
        return result
    }
}
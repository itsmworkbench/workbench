import {makeSovereignStatePlugin, useSelectedSovereign} from "@itsmworkbench/sovereign";
import React, {useEffect, useMemo, useState} from "react";
import {BooleanFeatureFlag, GetterSetter, makeGetterSetter, useWindowsPath, useWindowUrlData, windowUrlDataWithPart} from "@itsmworkbench/react_utils";
import {useCommonComponents} from "@itsmworkbench/common_components";
import {useAttributeValueComponents, useRenderers} from "@itsmworkbench/renderers";
import {lensBuilder} from "@itsmworkbench/optics";
import {camelCaseToWords} from "@itsmworkbench/utils";
import {ChatCompletionMessage} from "@itsmworkbench/ai2";
import {DisplayTicketProcess} from "@itsmworkbench/rippledown_react";
import {ActiveTicketState, ItsmState, useItsmState, useItsmStateProgress, useItsmStateTicket, useItsmTicketState} from "@itsmworkbench/itsm_state";
import {NamedUrl, UrlQuery, UrlStore} from "@itsmworkbench/urlstore";
import {ErrorsOr} from "@itsmworkbench/errors";
import {hasErrors} from "@laoban/utils";
import {Ticket} from "@itsmworkbench/tickets";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import {LoadingErrorsOr} from "@itsmworkbench/loading";


export const activeTicketsFF = "activeTickets"
export const activeTicketsFeatureFlag: BooleanFeatureFlag = {
    description: "Show Active Tickets instead of using old system",
    value: true
}


const acStateL = lensBuilder<ActiveTicketState>()
const queryL = acStateL.focusOn('query')
const activeCanvasL = acStateL.focusOn('activeCanvas')

type InputBoxProps = {
    ops: GetterSetter<string>
}

export function InputBox({ops}: InputBoxProps) {
    const [query, setQuery] = ops
    return <div style={{display: 'flex', alignItems: 'center', width: '100%'}}>
        <input
            style={{flexGrow: 1, padding: '0.5rem'}}
            type="text"
            value={query}
            placeholder="If you don't like the AI suggestion, comment here. Or ask 'help' or 'what can I do' for help "
            onChange={(e) => setQuery(e.target.value)}
        />
        <button
            style={{
                marginLeft: '0.5rem',
                padding: '0.5rem',
                cursor: 'pointer',
                border: '1px solid #ccc',
                background: 'white'
            }}
            onClick={() => console.log('Send clicked')}
        >➤
        </button>
    </div>
}

export type ChatWindowProps = {
    ops: GetterSetter<ActiveTicketState>
}


type CanvasSelectorProps = {
    ops: GetterSetter<string>
}


export function HelpCanvas() {
    return <div><p>Try typing</p>
        <ul>
            <li>What can I do (shows this)</li>
            <li>Some sql for example 'select * from yourtable': this opens the sql window</li>
            <li>Request more details: this opens the email window</li>
            <li>Request approval: this opens the email window asking for approval from</li>
        </ul>
        <p>You can use the buttons under the chat window to open the canvas as well</p>
        <p>The purpose of the chat window is to act as a record of what you have done. The AI is only offering limited support</p>
    </div>
}

export function TicketCanvas({ticket}: { ticket: Ticket }) {
    return <div>
        <pre>{JSON.stringify(ticket?.attributes, null, 2)}</pre>
        <p>{ticket?.description}</p>
    </div>
}

export function CanvasSelector({ops}: CanvasSelectorProps) {
    const {NavPanelLayout, SelectableButton} = useCommonComponents()
    return <NavPanelLayout size='small'>
        <SelectableButton prefix='canvas' text='help' selectedOps={ops}/>
        <SelectableButton prefix='canvas' text='ticket' selectedOps={ops}/>
        <SelectableButton prefix='canvas' text='sql' selectedOps={ops}/>
        <SelectableButton prefix='canvas' text='email' selectedOps={ops}/>
        <SelectableButton prefix='canvas' text='ldap' selectedOps={ops}/>
        <SelectableButton prefix='canvas' text='article' selectedOps={ops}/>
    </NavPanelLayout>
}

export function ChatWindow({ops}: ChatWindowProps) {
    const {ClipHeight} = useCommonComponents()
    const {H1} = useRenderers()
    const [state, setState] = ops
    const queryops = makeGetterSetter(state, setState, queryL)
    const activeCanvasOps = makeGetterSetter(state, setState, activeCanvasL)
    const rootId = 'chat-window'
    return <div>
        <H1 rootId={rootId} attribute={'query.title'} value={'Ask'}/>
        <ClipHeight force={false} maxHeight='400px'>
            <Messages messages={state.messages}/>
        </ClipHeight>
        <div>AI Recommends: Send an email to request missing data</div>
        <div> Because: This ticket doesn't include itemName</div>

        <InputBox ops={queryops}/>
        <CanvasSelector ops={activeCanvasOps}/>
    </div>
}

type CanvasWindowProps = {
    ops: GetterSetter<ActiveTicketState>
    ticket: Ticket
}

export type MessageProps = {
    message: ChatCompletionMessage
}

export function Message({message}: MessageProps) {
    return <div><p>{message.content}</p></div>
}

export function Messages({messages}: { messages: ChatCompletionMessage[] }) {
    return <div>{messages.map((m, i) => <Message key={i} message={m}/>)}</div>
}

export function CanvasWindow({ops, ticket}: CanvasWindowProps) {
    const [state, setState] = ops
    const {activeCanvas} = state
    const {H1} = useRenderers()
    const rootId = 'canvas-window'
    const ticketProgressOps = useItsmState()
    return <div>
        <DisplayTicketProcess ops={ticketProgressOps}/>
        <H1 rootId={rootId} attribute={`canvas.${activeCanvas}`} value={camelCaseToWords(activeCanvas)}/>
        {activeCanvas === 'help' && <HelpCanvas/>}
        {activeCanvas === 'ticket' && <TicketCanvas ticket={ticket}/>}
    </div>
}

export type LoadKaProps = {
    urlStore: UrlStore
    name: string | undefined
}

export async function loadKnowledgeArticle({urlStore, name}: LoadKaProps): Promise<ErrorsOr<Ticket>> {
    if (!name) throw new Error(`No id provided`)
    const url: NamedUrl = {scheme: 'itsm', organisation: 'me', namespace: 'ticket', name}
    const res = await urlStore.loadNamed<Ticket>(url)
    return hasErrors(res) ? {errors: res} : {value: res.result};
}

export type ActiveWindowsProps = {
    ticket: Ticket
}

const lb = lensBuilder<ItsmState>()

export function ActiveWindows({ticket}: ActiveWindowsProps) {
    const {DataLayout} = useAttributeValueComponents()
    const ticketStateOps = useItsmTicketState()
    const {TwoColumnAndRestLayout} = useCommonComponents()
    const rootId = 'ticket';
    return <DataLayout rootId={rootId}>
        <TwoColumnAndRestLayout>
            <ChatWindow ops={ticketStateOps}/>
            <CanvasWindow ticket={ticket} ops={ticketStateOps}/>
        </TwoColumnAndRestLayout></DataLayout>
}

export function ListTickets() {
    //set the path by asking chat gpt.
    const [ticketNames, setTicketNames] = useState<string[]>([])
    const urlStore = useUrlStore()
    const [url, setUrl] = useWindowUrlData()
    useEffect(() => {
        const query: UrlQuery = {org: 'me', namespace: 'ticketevents', pageQuery: {page: 1, pageSize: 20}, order: "name"}
        urlStore.list(query).then(res => {
            if (hasErrors(res)) setTicketNames(['Error', ...res])
            else setTicketNames(res.names)
        })
    }, []);

    const onClick = (name: string) => () => {
        setUrl(x => {
//TODO Let's clean this up
            const windowUrlData = windowUrlDataWithPart(x, 1, name);
            //update browser url to include the ticket name
            window.history.pushState({}, '', windowUrlData.url);
            return windowUrlData;
        });
    };

    return <ul>{ticketNames.map((n, i) => <li key={i}><a onClick={onClick(n)}>{n}</a></li>)}</ul>
}

export function ActiveTicketsSovereignPane() {
    const path = useWindowsPath()
    const name = path[1]
    if (!name) return <ListTickets/>
    const urlStore = useUrlStore()
    const [ticket, setTicket] = useItsmStateTicket()
    const loadProps: LoadKaProps = useMemo(() => ({urlStore, name}), [urlStore, name])
    return <LoadingErrorsOr kleisli={loadKnowledgeArticle} onLoad={t => setTicket(t)} input={loadProps}>{ticket =>
        <ActiveWindows ticket={ticket}/>}
    </LoadingErrorsOr>
}

export const ActiveTicketsSovereignPagePlugin = makeSovereignStatePlugin(ActiveTicketsSovereignPane)


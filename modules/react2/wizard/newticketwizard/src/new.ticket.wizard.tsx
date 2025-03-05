import {useWizardComponents, Wizard} from "@itsmworkbench/wizard";
import {DisplaySovereignPage, makeSovereignStatePlugin, SovereignStatePlugin, useSelectedSovereign} from "@itsmworkbench/sovereign";
import React, {useCallback, useEffect} from "react";
import {CreateTicketWizardPage} from "./create.ticket.wizard.page";
import {Ticket} from "@itsmworkbench/tickets";
import {SelectKnowledgeArticleTicketWizardPage} from "./select.knowledge.article.ticket.wizard.page";
import {useSystems} from "@itsmworkbench/system";
import {useTicketSources} from "@itsmworkbench/ticketsource";
import {CreateNewKnowledgeArticleWizardPage} from "./create.new.knowledge.article.wizard.page";
import {useItsmState} from "@itsmworkbench/itsm_state";
import {NamedUrl, UrlStore} from "@itsmworkbench/urlstore";
import {useUrlStore} from "@itsmworkbench/reacturlstore";
import {KADetails} from "@itsmworkbench/knowledgearticle";
import {SetIdEvent, SetValueEvent} from "@itsmworkbench/events";
import {hasErrors} from "@laoban/utils";


export const NewTicketWizard: Wizard<Ticket> = {
    createTicket: {
        descriptionKey: 'newTicket.wizard.createTicket',
        Panel: CreateTicketWizardPage
    },
    selectKnowledgeArticle: {
        descriptionKey: 'newTicket.wizard.selectKnowledgeArticle',
        Panel: SelectKnowledgeArticleTicketWizardPage
    },
    createNewKnowledgeArticle: {
        descriptionKey: 'newTicket.wizard.createNewKnowledgeArticle',
        Panel: CreateNewKnowledgeArticleWizardPage
    }

}

export async function saveTicketToUrlStore(urlStore: UrlStore, ticket: Ticket, kad: KADetails) {
    if (!kad.ka) throw new Error('KADetails not defined')
    const ticketUrl: NamedUrl = {scheme: 'itsm', name: ticket.id, namespace: 'ticket', organisation: 'me'}
    const ticketRes = await urlStore.save(ticketUrl, ticket)
    if (hasErrors(ticketRes))
        throw new Error(`Error saving ticket ${ticket.id} to url store: ${ticketRes.join(';')}`)
    console.log('saved ticket', ticketUrl, ticket, ticketRes)

    const event1: SetValueEvent = {
        "event": "setValue", "path": "forTicket.tempData.ticketType", value: {//really want a type type details... if it's new... so consider this later
            ticketType: {
                variable: kad.ka.variables,
                capabilities: kad.ka.capabilities,
                actions: kad.ka.actions,
                id: kad.id,
                name: kad.name,
            }
        },
        "context": {"display": {"title": "Ticket Type", "type": "ticketType", "hide": true}}
    }

    const event2: SetIdEvent = {
        "event": "setId",
        "path": "forTicket.ticket",
        id: ticketRes.id,
        context: {
            display: {"title": "New Ticket", "type": "ticket", "name": kad.name},
        }
    }
    const event3: SetValueEvent = {
        "event": "setValue",
        "value": true,
        "path": "forTicket.status.CheckTicket.ReviewTicket",
        "context": { //hack.
            "where": {"phase": "CheckTicket", "action": "ReviewTicket", "tab": "ReviewTicketWorkbench"},
            "capability": "ReviewTicket",
            "display": {"title": "Review Ticket", "type": "ReviewTicket", "successOrFail": true},
            "data": {
                "attributes": ticket.attributes
            }
        }
    }
    const events = [event1, event2, event3]
    const eventUrl: NamedUrl = {scheme: 'itsm', name: ticket.id, namespace: 'ticketevents', organisation: 'me'}
    console.log('event', eventUrl, events)
    const res = await urlStore.save(eventUrl, events)
    console.log('saved event', eventUrl, res)

}

export const NewTicketSovereignPane: DisplaySovereignPage = () => {
    const {Display} = useWizardComponents();
    const [ntd, setNtd] = useItsmState()
    const systems = useSystems()
    const sources = useTicketSources()
    const urlStore = useUrlStore()

    const [sov, setSov] = useSelectedSovereign()
    useEffect(() => {
        if (ntd.system === '')
            setNtd({...ntd, system: Object.keys(systems)[0], source: Object.keys(sources)[0]})
    }, []);
    const onFinish = useCallback((ticket: Ticket) => {
        saveTicketToUrlStore(urlStore, ticket, ntd.ka)
        setSov('')
    }, [ntd, urlStore])
    return <Display wizard={NewTicketWizard} onFinish={onFinish}/>
};


export const NewTicketSovereignPanePlugin: SovereignStatePlugin = makeSovereignStatePlugin(NewTicketSovereignPane)

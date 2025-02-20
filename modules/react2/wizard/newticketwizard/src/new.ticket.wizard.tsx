import {useWizardComponents, Wizard} from "@itsmworkbench/wizard";
import {DisplaySovereignPage, makeSovereignStatePlugin, SovereignStatePlugin} from "@itsmworkbench/sovereign";
import React, {useEffect, useState} from "react";
import {CreateTicketWizardPage} from "./create.ticket.wizard.page";
import {Ticket} from "@itsmworkbench/tickets";
import {SelectKnowledgeArticleTicketWizardPage} from "./select.knowledge.article.ticket.wizard.page";
import {useSystems} from "@itsmworkbench/system";
import {makeContextForState, makeUseStateChild} from "@itsmworkbench/react_utils";
import {useTicketSources} from "@itsmworkbench/ticketsource";


export type NewTicketWizardData = {
    source: string
    system: string
    ticket: Ticket
    kaName: string
}
export const emptyNewTicketWizardData = {system: '', source: '', ticket: {} as Ticket, kaName: ''}
export const NewTicketWizard: Wizard<Ticket> = {
    createTicket: {
        descriptionKey: 'newTicket.wizard.createTicket',
        Panel: CreateTicketWizardPage
    },
    selectKnowledgeArticle: {
        descriptionKey: 'newTicket.wizard.selectKnowledgeArticle',
        Panel: SelectKnowledgeArticleTicketWizardPage
    },

}

export const NewTicketSovereignPane: DisplaySovereignPage = () => {
    const {Display} = useWizardComponents();
    const [ntd, setNtd] = useNewTicketWizardData()
    const systems = useSystems()
    const sources = useTicketSources()
    useEffect(() => {
        if (ntd.system === '')
            setNtd({system: Object.keys(systems)[0], source: Object.keys(sources)[0], ticket: {} as Ticket, kaName: ''})
    }, []);
    const ops = useState<Ticket>({} as Ticket);
    return <Display wizard={NewTicketWizard} ops={ops}/>
};
export const {use: useNewTicketWizardData, Provider: NewTicketWizardProvider} = makeContextForState<NewTicketWizardData, 'newWizardData'>('newWizardData')
export const useNewTicketSource = makeUseStateChild(useNewTicketWizardData, id => id.focusOn('source'))
export const useNewTicketSystem = makeUseStateChild(useNewTicketWizardData, id => id.focusOn('system'))
export const useNewTicketTicket = makeUseStateChild(useNewTicketWizardData, id => id.focusOn('ticket'))
export const useNewTicketKaName = makeUseStateChild(useNewTicketWizardData, id => id.focusOn('kaName'))
export const NewTicketSovereignPanePlugin: SovereignStatePlugin = makeSovereignStatePlugin(NewTicketSovereignPane)

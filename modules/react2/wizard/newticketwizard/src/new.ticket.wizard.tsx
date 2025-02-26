import {useWizardComponents, Wizard} from "@itsmworkbench/wizard";
import {DisplaySovereignPage, makeSovereignStatePlugin, SovereignStatePlugin, useSelectedSovereign} from "@itsmworkbench/sovereign";
import React, {useEffect, useState} from "react";
import {CreateTicketWizardPage} from "./create.ticket.wizard.page";
import {Ticket} from "@itsmworkbench/tickets";
import {SelectKnowledgeArticleTicketWizardPage} from "./select.knowledge.article.ticket.wizard.page";
import {useSystems} from "@itsmworkbench/system";
import {useTicketSources} from "@itsmworkbench/ticketsource";
import {CreateNewKnowledgeArticleWizardPage} from "./create.new.knowledge.article.wizard.page";
import {useItsmState} from "@itsmworkbench/itsm_state";


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

export const NewTicketSovereignPane: DisplaySovereignPage = () => {
    const {Display} = useWizardComponents();
    const [ntd, setNtd] = useItsmState()
    const systems = useSystems()
    const sources = useTicketSources()
    const [sov, setSov] = useSelectedSovereign()
    useEffect(() => {
        if (ntd.system === '')
            setNtd({...ntd, system: Object.keys(systems)[0], source: Object.keys(sources)[0]})
    }, []);
    const ops = useState<Ticket>({} as Ticket);
    return <Display wizard={NewTicketWizard} ops={ops} onFinish={() => setSov('')}/>
};
export const NewTicketSovereignPanePlugin: SovereignStatePlugin = makeSovereignStatePlugin(NewTicketSovereignPane)

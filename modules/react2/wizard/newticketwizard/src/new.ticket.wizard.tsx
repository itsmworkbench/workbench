import {SimpleWizardDescriptionPanel, useWizardComponents, Wizard} from "@itsmworkbench/wizard";
import {DisplaySovereignPage, makeSovereignStatePlugin, SovereignStatePlugin} from "@itsmworkbench/sovereign";
import React, {useState} from "react";
import {CreateTicketWizardPage} from "./create.ticket.wizard.page";
import {Ticket} from "@itsmworkbench/tickets";
import {SelectKnowledgeArticleTicketWizardPage} from "./select.knowledge.article.ticket.wizard.page";

export const NewTicketWizard: Wizard<any> = {
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
    const ops = useState<Ticket>({} as Ticket);
    return <Display wizard={NewTicketWizard} ops={ops}/>
};

export const NewTicketSovereignPanePlugin: SovereignStatePlugin = makeSovereignStatePlugin(NewTicketSovereignPane)

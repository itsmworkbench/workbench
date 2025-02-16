import {DisplayWizard, SimpleWizardDescriptionPanel, useWizardComponents, Wizard} from "@itsmworkbench/wizard";
import {DisplaySovereignPage, makeSovereignStatePlugin, SovereignStatePlugin} from "@itsmworkbench/sovereign";
import React, {useState} from "react";

export const NewTicketWizard: Wizard<any> = {
    whereIsTicket: {
        descriptionKey: 'newTicket.wizard.whereIsTicket',
        Panel: SimpleWizardDescriptionPanel()
    },
    createTicket: {
        descriptionKey: 'newTicket.wizard.createTicket',
        Panel: SimpleWizardDescriptionPanel()
    },
    howToProcessTicket: {
        descriptionKey: 'newTicket.wizard.howToProcessTicket',
        Panel: SimpleWizardDescriptionPanel()
    },
    selectKnowledgeArticle: {
        descriptionKey: 'newTicket.wizard.selectKnowledgeArticle',
        Panel: SimpleWizardDescriptionPanel()
    },

}

export const NewTicketSovereignPane: DisplaySovereignPage = () => {
    const {Display} = useWizardComponents();
    const ops = useState<any>({}); //will become set ticket when we do that...
    return <Display wizard={NewTicketWizard} ops={ops}/>
};

export const NewTicketSovereignPanePlugin: SovereignStatePlugin = makeSovereignStatePlugin(NewTicketSovereignPane)

import {approvalTT, checkUsersTT, installSoftwareTT, simpleTicketType, KnowledgeArticle, updateSqlTT, usingKATT, usingTicketTypeTT} from "./knowledgeArticle";
import {deepCombineTwoObjects} from "@laoban/utils";
import {ObjectDefn} from "@itsmworkbench/object_defn";
import {lensBuilder} from "@itsmworkbench/optics";

export type ApprovalState = 'Pre Approved' | 'Needs Approval' | 'No Approval Needed';
export type TicketTypeName = 'General' | 'Update Database' | 'Install Software';
export type ValidateInvolvedParties = boolean;

export interface KnowledgeArticleDetails {
    name: string,
    description: string,
    ticketType: TicketTypeName;
    approvalState: ApprovalState;
    validateInvolvedParties: ValidateInvolvedParties;
    usingKnowledgeArticle?: string
}

const kadNameL = lensBuilder<KnowledgeArticleDetails>().focusOn('name');
const kadDescriptionL = lensBuilder<KnowledgeArticleDetails>().focusOn('description');
const kadTicketTypeL = lensBuilder<KnowledgeArticleDetails>().focusOn('ticketType');
const kadApprovalStateL = lensBuilder<KnowledgeArticleDetails>().focusOn('approvalState');
const kadValidateInvolvedPartiesL = lensBuilder<KnowledgeArticleDetails>().focusOn('validateInvolvedParties');
export const knowledgeArticleDetailsObjectDefn: ObjectDefn<KnowledgeArticleDetails> = {
    layout: [1, 1, 1, 1, 1],
    fields: {
        name: {fieldType: 'string', lens: kadNameL},
        description: {fieldType: 'string', lens: kadDescriptionL},
        ticketType: {fieldType: 'options', lens: kadTicketTypeL, options: ['General', 'Update Database', 'Install Software']},
        approvalState: {fieldType: 'options', lens: kadApprovalStateL, options: ['Pre Approved', 'Needs Approval', 'No Approval Needed']},
        validateInvolvedParties: {fieldType: 'boolean', lens: kadValidateInvolvedPartiesL},
    }
}
export const defaultKnowledgeArticleDetails: KnowledgeArticleDetails = {
    name: '',
    description: '',
    ticketType: 'General',
    approvalState: 'Needs Approval',
    validateInvolvedParties: false,
}

export function detailsToKnowledgeArticle(details: KnowledgeArticleDetails): KnowledgeArticle {
    const acc: KnowledgeArticle[] = [simpleTicketType]
    acc.push(details.usingKnowledgeArticle ? usingKATT : usingTicketTypeTT)
    if (details.ticketType === 'Update Database') acc.push(updateSqlTT)
    if (details.ticketType === 'Install Software') acc.push(installSoftwareTT)
    if (details.approvalState === 'Needs Approval') acc.push(approvalTT)
    if (details.validateInvolvedParties) acc.push(checkUsersTT)
    let raw = acc.reduce<KnowledgeArticle>(deepCombineTwoObjects, {} as KnowledgeArticle);
    return {...raw, capabilities: [...new Set(raw.capabilities)].sort()}
}
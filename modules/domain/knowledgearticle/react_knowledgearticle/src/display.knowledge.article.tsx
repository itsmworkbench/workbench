import {KnowledgeArticle} from "@itsmworkbench/knowledgearticle";
import {PhaseName} from "@itsmworkbench/domain";

export type DisplayKnowledgeArticleProps={
    ka: KnowledgeArticle
}
export type DisplayKnowledgeArticle = (props: DisplayKnowledgeArticleProps) => React.ReactElement

export type DisplayPhaseProps={
    phaseName: PhaseName
    phase: PhaseName
}
